'use client';

import { useState, useEffect } from 'react';

const COMMUNITY_CATEGORIES = [
  {
    category: 'IT/테크',
    sites: [
      { name: 'clien', display: '클리앙', emoji: '💻' },
      { name: 'slrclub', display: 'SLR클럽', emoji: '📷' },
      { name: 'etoland', display: '이토랜드', emoji: '🔧' },
    ],
  },
  {
    category: '게임',
    sites: [
      { name: 'ruliweb', display: '루리웹', emoji: '🎮' },
      { name: 'inven', display: '인벤', emoji: '⚔️' },
    ],
  },
  {
    category: '여성향',
    sites: [
      { name: 'theqoo', display: '더쿠', emoji: '👗' },
      { name: 'natepann', display: '네이트판', emoji: '💄' },
      { name: 'cook82', display: '82쿡', emoji: '🍳' },
    ],
  },
  {
    category: '생활/유머',
    sites: [
      { name: 'ppomppu', display: '뽐뿌', emoji: '💰' },
      { name: 'mlbpark', display: '엠팍', emoji: '⚾' },
      { name: 'bobaedream', display: '보배드림', emoji: '🚗' },
      { name: 'humoruniv', display: '웃긴대학', emoji: '😂' },
      { name: 'todayhumor', display: '오늘의유머', emoji: '🤣' },
    ],
  },
];

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);

  useEffect(() => {
    // 첫 방문 여부 확인
    const hasSeenOnboarding = localStorage.getItem('onboarding-completed');
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, []);

  const toggleSite = (siteName: string) => {
    setSelectedSites(prev =>
      prev.includes(siteName)
        ? prev.filter(s => s !== siteName)
        : [...prev, siteName]
    );
  };

  const handleComplete = () => {
    // 선택한 커뮤니티 저장
    localStorage.setItem('favorite-sites', JSON.stringify(selectedSites));
    localStorage.setItem('onboarding-completed', 'true');
    setIsOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {step === 1 && (
          <div className="p-8 text-center">
            <div className="text-6xl mb-6">👋</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              통합 커뮤니티에 오신 것을 환영합니다!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              17개 커뮤니티의 인기글을<br />
              한 곳에서 편리하게 확인하세요
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-3xl mb-2">⚡</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">실시간 업데이트</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">30분마다</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">17개 커뮤니티</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">한눈에</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="text-3xl mb-2">✨</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">깔끔한 UI</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">광고 최소화</div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              시작하기
            </button>
            <button
              onClick={handleSkip}
              className="w-full mt-2 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              건너뛰기
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              관심 커뮤니티를 선택하세요
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              선택한 커뮤니티의 게시글을 우선 표시합니다 (3개 이상 권장)
            </p>

            <div className="space-y-6 mb-8">
              {COMMUNITY_CATEGORIES.map(({ category, sites }) => (
                <div key={category}>
                  <div className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sites.map(({ name, display, emoji }) => (
                      <button
                        key={name}
                        onClick={() => toggleSite(name)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedSites.includes(name)
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{emoji}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {display}
                          </span>
                          {selectedSites.includes(name) && (
                            <span className="ml-auto text-blue-600">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                이전
              </button>
              <button
                onClick={handleComplete}
                className={`flex-1 py-3 font-bold rounded-xl transition-colors ${
                  selectedSites.length >= 3
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={selectedSites.length < 3}
              >
                완료 ({selectedSites.length}/3)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
