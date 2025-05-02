'use client';

import { useState, useEffect } from 'react';
import { format, differenceInMinutes, isBefore, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface CheckInState {
  date: string;
  isChecked: boolean;
}

interface QuittingTime {
  hour: number;
  minute: number;
}

export default function Home() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [sortOrder, setSortOrder] = useState<'priority' | 'added'>('priority');
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);
  const [quittingTime, setQuittingTime] = useState<QuittingTime>({ hour: 17, minute: 30 });
  const [isEditingQuittingTime, setIsEditingQuittingTime] = useState(false);
  const [tempQuittingTime, setTempQuittingTime] = useState<QuittingTime>({ hour: 17, minute: 30 });

  // マウント時にクライアントサイドであることを確認
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    if (!isMounted) return;
    
    const savedTasks = localStorage.getItem('tasks');
    const savedCheckIn = localStorage.getItem('checkInState');
    const savedQuittingTime = localStorage.getItem('quittingTime');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedCheckIn) {
      const checkInState: CheckInState = JSON.parse(savedCheckIn);
      const today = format(new Date(), 'yyyy-MM-dd');
      // 日付が変わっていたら確定状態をリセット
      if (checkInState.date !== today) {
        setIsCheckedIn(false);
      } else {
        setIsCheckedIn(checkInState.isChecked);
      }
    }
    if (savedQuittingTime) {
      setQuittingTime(JSON.parse(savedQuittingTime));
    }
  }, [isMounted]);

  // データをローカルストレージに保存
  useEffect(() => {
    if (!isMounted) return;
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
    const checkInState: CheckInState = {
      date: format(new Date(), 'yyyy-MM-dd'),
      isChecked: isCheckedIn
    };
    localStorage.setItem('checkInState', JSON.stringify(checkInState));
    localStorage.setItem('quittingTime', JSON.stringify(quittingTime));
  }, [tasks, isCheckedIn, quittingTime, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // 9時を過ぎているかチェック
      const deadline = new Date();
      deadline.setHours(9, 0, 0, 0);
      setIsAfterDeadline(isBefore(deadline, now));

      // 日付が変わったら確定状態をリセット
      if (currentTime && !isSameDay(currentTime, now)) {
        setIsCheckedIn(false);
        // 日付変更時にローカルストレージも更新
        const checkInState: CheckInState = {
          date: format(now, 'yyyy-MM-dd'),
          isChecked: false
        };
        localStorage.setItem('checkInState', JSON.stringify(checkInState));
      }
    };

    // 初回実行
    updateTime();
    
    // 1秒ごとに更新
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [isMounted]);

  const handleCheckIn = () => {
    const newCheckedInState = !isCheckedIn;
    setIsCheckedIn(newCheckedInState);
    
    // 確定状態を変更したら即座にローカルストレージを更新
    const checkInState: CheckInState = {
      date: format(new Date(), 'yyyy-MM-dd'),
      isChecked: newCheckedInState
    };
    localStorage.setItem('checkInState', JSON.stringify(checkInState));
  };

  const handleQuittingTimeChange = (hour: number, minute: number) => {
    setTempQuittingTime({ hour, minute });
  };

  const handleSaveQuittingTime = () => {
    setQuittingTime(tempQuittingTime);
    setIsEditingQuittingTime(false);
  };

  const handleOpenQuittingTimeModal = () => {
    setTempQuittingTime(quittingTime);
    setIsEditingQuittingTime(true);
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { 
        id: Date.now().toString(), 
        text: newTask, 
        completed: false,
        priority: newTaskPriority
      }]);
      setNewTask('');
      setNewTaskPriority('medium');
    }
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleChangePriority = (id: string, priority: 'high' | 'medium' | 'low') => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, priority } : task
    ));
  };

  const getSortedTasks = () => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      if (sortOrder === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });
  };

  const isQuittingTime = currentTime ? 
    currentTime.getHours() >= quittingTime.hour && 
    currentTime.getMinutes() >= quittingTime.minute : false;

  const minutesUntilQuitting = currentTime ? differenceInMinutes(
    new Date().setHours(quittingTime.hour, quittingTime.minute, 0),
    currentTime
  ) : 0;

  const minutesAfterQuitting = currentTime ? -minutesUntilQuitting : 0;
  const isWithinQuittingLimit = minutesAfterQuitting <= 30;

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-700">
          <p className="font-medium mb-2">📝 ご利用上の注意</p>
          <ul className="list-disc list-inside space-y-1">
            <li>このアプリはブラウザのローカルストレージにデータを保存するため、タスク名などの情報は他のユーザーには見えません</li>
            <li>データは使用しているブラウザにのみ保存され、別のブラウザや端末では共有されません</li>
            <li>ブラウザのキャッシュを削除するとデータが消去されます</li>
          </ul>
        </div>

        {/* 時刻表示 */}
        <div className={`bg-white p-4 sm:p-8 rounded-2xl shadow-lg transition-all duration-500 ${
          isQuittingTime ? 'bg-red-50 border-2 border-red-500 animate-pulse' : 
          !isCheckedIn && isAfterDeadline ? 'bg-yellow-50 border-2 border-yellow-500 animate-pulse' : ''
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">現在時刻</h2>
              <p className="text-sm text-gray-500 mt-1">
                {!isCheckedIn && isAfterDeadline
                  ? '⚠️ 勤怠管理システムでの確定が必要です'
                  : !isCheckedIn
                  ? '🌅 おはようございます！'
                  : ''
                }
              </p>
            </div>
            <button
              onClick={handleCheckIn}
              className={`px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base ${
                isCheckedIn
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg transform hover:-translate-y-0.5 animate-pulse'
              }`}
            >
              {isCheckedIn ? '勤怠管理システムで確定済み' : '勤怠管理システムで確定した'}
            </button>
          </div>
          <div className="flex flex-col items-center">
            {isMounted ? (
              <>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-4 w-full">
                  <div className="text-center w-full sm:w-auto">
                    <p className="text-4xl sm:text-5xl font-mono text-gray-900">
                      {format(currentTime, 'HH:mm:ss', { locale: ja })}
                    </p>
                    <p className="text-lg sm:text-xl font-mono text-gray-600 mt-2">
                      {format(currentTime, 'yyyy年MM月dd日 (EEEE)', { locale: ja })}
                    </p>
                  </div>
                  {!isQuittingTime && isCheckedIn && (
                    <div className="text-center w-full sm:w-auto sm:border-l sm:border-gray-200 sm:pl-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <p className="text-base sm:text-lg text-gray-600">
                          {minutesUntilQuitting >= 0 ? '終業時刻まで' : '終業時刻から'}
                        </p>
                        <button
                          onClick={handleOpenQuittingTimeModal}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ⚙️
                        </button>
                      </div>
                      <p className="text-2xl sm:text-3xl font-mono text-blue-600">
                        {Math.abs(Math.floor(minutesUntilQuitting / 60))}時間 {Math.abs(minutesUntilQuitting % 60)}分
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {minutesUntilQuitting >= 0 ? (
                          minutesUntilQuitting > 120 
                            ? '🚀 まだまだ時間はたっぷり！'
                            : minutesUntilQuitting > 60
                            ? '💪 あと少し頑張りましょう！'
                            : '⏰ もうすぐ終業です！'
                        ) : (
                          Math.abs(minutesUntilQuitting) > 30
                            ? '⚠️ 退社すべき時間を超過しています'
                            : '⏰ 退社すべき時間です'
                        )}
                      </p>
                    </div>
                  )}
                </div>
                {isQuittingTime && (
                  <div className="mt-4 p-4 sm:p-5 bg-red-100 rounded-xl text-center w-full border border-red-200">
                    <p className="text-xl sm:text-2xl text-red-600 font-bold animate-bounce">
                      ⏰ 終業時刻です！
                    </p>
                    <p className="text-red-600 mt-2 text-sm sm:text-base">
                      {isWithinQuittingLimit 
                        ? `お疲れ様でした。退社すべきまでの残り時間は${30 - minutesAfterQuitting}分です。`
                        : '⚠️ 退社すべき時間（30分）を超過しています。報告が必要になります。'
                      }
                    </p>
                  </div>
                )}
                {isQuittingTime && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleOpenQuittingTimeModal}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center justify-center gap-1"
                    >
                      <span>⚙️</span>
                      <span>終業時刻を変更</span>
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>

        {/* 終業時刻設定モーダル */}
        {isEditingQuittingTime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4">終業時刻を設定</h3>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">時</label>
                  <select
                    value={tempQuittingTime.hour}
                    onChange={(e) => handleQuittingTimeChange(Number(e.target.value), tempQuittingTime.minute)}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i}時</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-2">分</label>
                  <select
                    value={tempQuittingTime.minute}
                    onChange={(e) => handleQuittingTimeChange(tempQuittingTime.hour, Number(e.target.value))}
                    className="w-full p-2 border rounded-lg"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>{i}分</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsEditingQuittingTime(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveQuittingTime}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  設定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* タスク管理 */}
        <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">タスク管理</h2>
            <div className="flex items-center gap-4">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'priority' | 'added')}
                className="p-2 border rounded-lg text-sm"
              >
                <option value="priority">優先度順</option>
                <option value="added">追加順</option>
              </select>
              <p className="text-sm text-gray-500">
                {tasks.length > 0 
                  ? `📋 残り${tasks.filter(t => !t.completed).length}タスク`
                  : '✨ すべてのタスクが完了しています！'
                }
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="新しいタスクを入力"
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="high">高優先度</option>
              <option value="medium">中優先度</option>
              <option value="low">低優先度</option>
            </select>
            <button
              onClick={handleAddTask}
              className="bg-green-500 text-white px-6 py-3 rounded-xl hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium"
            >
              追加
            </button>
        </div>
          <ul className="space-y-3">
            {getSortedTasks().map((task) => (
              <li
                key={task.id}
                className={`flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-gray-100 transition-colors ${
                  task.priority === 'high' ? 'bg-red-50' :
                  task.priority === 'medium' ? 'bg-yellow-50' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <span className={`text-base sm:text-lg ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {task.text}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={task.priority}
                    onChange={(e) => handleChangePriority(task.id, e.target.value as 'high' | 'medium' | 'low')}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                  </select>
                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
    </div>
    </main>
  );
}
