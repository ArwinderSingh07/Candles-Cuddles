import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { SparklesIcon } from '@heroicons/react/24/solid';
import type { Product } from '../types';

interface QuizAnswer {
  questionId: number;
  answer: string;
}

const questions = [
  {
    id: 1,
    question: 'What mood are you looking to create?',
    options: [
      { value: 'relax', label: 'Relaxation & Calm', icon: '🧘' },
      { value: 'energize', label: 'Energy & Focus', icon: '⚡' },
      { value: 'romance', label: 'Romance & Intimacy', icon: '💕' },
      { value: 'cozy', label: 'Cozy & Warm', icon: '🔥' },
    ],
  },
  {
    id: 2,
    question: 'Where will you use this candle?',
    options: [
      { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
      { value: 'living', label: 'Living Room', icon: '🛋️' },
      { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
      { value: 'office', label: 'Office/Workspace', icon: '💼' },
    ],
  },
  {
    id: 3,
    question: 'What time of day do you prefer?',
    options: [
      { value: 'morning', label: 'Morning', icon: '🌅' },
      { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
      { value: 'evening', label: 'Evening', icon: '🌆' },
      { value: 'night', label: 'Night', icon: '🌙' },
    ],
  },
  {
    id: 4,
    question: 'What scent family appeals to you?',
    options: [
      { value: 'floral', label: 'Floral', icon: '🌸' },
      { value: 'woody', label: 'Woody & Earthy', icon: '🌲' },
      { value: 'citrus', label: 'Citrus & Fresh', icon: '🍋' },
      { value: 'spicy', label: 'Spicy & Warm', icon: '🌶️' },
      { value: 'sweet', label: 'Sweet & Gourmand', icon: '🍯' },
    ],
  },
  {
    id: 5,
    question: 'What occasion is this for?',
    options: [
      { value: 'daily', label: 'Daily Use', icon: '📅' },
      { value: 'gift', label: 'Gift for Someone', icon: '🎁' },
      { value: 'special', label: 'Special Occasion', icon: '✨' },
      { value: 'self-care', label: 'Self-Care Ritual', icon: '💆' },
    ],
  },
];

// Scent recommendation logic based on answers
const getRecommendations = (answers: QuizAnswer[], products: Product[]): Product[] => {
  if (!products || products.length === 0) return [];

  // Score products based on answers
  const scoredProducts = products.map((product) => {
    let score = 0;
    const productTags = (product.tags || []).map((t) => t.toLowerCase());
    const productCategory = (product.category || '').toLowerCase();
    const productDescription = (product.description || '').toLowerCase();

    answers.forEach((answer) => {
      const answerValue = answer.answer.toLowerCase();

      // Mood matching
      if (answer.questionId === 1) {
        if (answerValue === 'relax' && (productTags.includes('calm') || productTags.includes('relax') || productDescription.includes('calming'))) {
          score += 3;
        }
        if (answerValue === 'energize' && (productTags.includes('energizing') || productTags.includes('fresh') || productDescription.includes('energizing'))) {
          score += 3;
        }
        if (answerValue === 'romance' && (productTags.includes('romantic') || productTags.includes('floral') || productDescription.includes('romantic'))) {
          score += 3;
        }
        if (answerValue === 'cozy' && (productTags.includes('warm') || productTags.includes('cozy') || productDescription.includes('warm'))) {
          score += 3;
        }
      }

      // Scent family matching
      if (answer.questionId === 4) {
        if (answerValue === 'floral' && (productTags.includes('floral') || productTags.includes('rose') || productTags.includes('jasmine') || productDescription.includes('floral'))) {
          score += 4;
        }
        if (answerValue === 'woody' && (productTags.includes('woody') || productTags.includes('sandalwood') || productTags.includes('cedar') || productDescription.includes('wood'))) {
          score += 4;
        }
        if (answerValue === 'citrus' && (productTags.includes('citrus') || productTags.includes('lemon') || productTags.includes('orange') || productDescription.includes('citrus'))) {
          score += 4;
        }
        if (answerValue === 'spicy' && (productTags.includes('spicy') || productTags.includes('cinnamon') || productTags.includes('vanilla') || productDescription.includes('spice'))) {
          score += 4;
        }
        if (answerValue === 'sweet' && (productTags.includes('sweet') || productTags.includes('vanilla') || productTags.includes('honey') || productDescription.includes('sweet'))) {
          score += 4;
        }
      }

      // Category matching
      if (productCategory === answerValue) {
        score += 2;
      }

      // General tag matching
      if (productTags.includes(answerValue)) {
        score += 2;
      }
    });

    return { product, score };
  });

  // Sort by score and return top 3-6 products
  const sorted = scoredProducts.sort((a, b) => b.score - a.score);
  const topProducts = sorted.filter((item) => item.score > 0).slice(0, 6);

  // If no matches, return random products
  if (topProducts.length === 0) {
    return products.slice(0, 3);
  }

  return topProducts.map((item) => item.product);
};

export const ScentFinderPage = () => {
  const navigate = useNavigate();
  const { data: products } = useProducts();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleAnswer = (answerValue: string) => {
    setSelectedAnswer(answerValue);
    setIsTransitioning(true);

    setTimeout(() => {
      const newAnswers = [...answers, { questionId: questions[currentQuestion].id, answer: answerValue }];
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Quiz complete, calculate recommendations
        const recs = getRecommendations(newAnswers, products || []);
        setRecommendations(recs);
        setShowResults(true);
      }
      setIsTransitioning(false);
    }, 400);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setRecommendations([]);
  };

  if (showResults) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse-glow rounded-full bg-brand/20"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-5xl shadow-lg">
              ✨
            </div>
          </div>
          <h1 className="font-display text-4xl text-brand-dark animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your Perfect Scents Await!
          </h1>
          <p className="mt-4 text-lg text-brand-dark/70 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Based on your preferences, we've curated these special recommendations just for you
          </p>
          <div className="mt-6 flex justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <SparklesIcon key={i} className="h-5 w-5 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>

        {recommendations.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-3">
              {recommendations.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <button
                onClick={handleRestart}
                className="group rounded-full border-2 border-brand px-8 py-3 font-semibold text-brand transition-all hover:bg-brand hover:text-white hover:shadow-lg hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  🔄 Take Quiz Again
                </span>
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="group rounded-full bg-gradient-to-r from-brand to-brand-dark px-8 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <span className="flex items-center justify-center gap-2">
                  Browse All Products
                  <span>→</span>
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-light/20 text-4xl">
              🕯️
            </div>
            <p className="text-brand-dark/70 mb-6 text-lg">We're still learning about your preferences!</p>
            <button
              onClick={() => navigate('/shop')}
              className="rounded-full bg-brand px-8 py-3 font-semibold text-white transition hover:bg-brand-dark hover:shadow-lg"
            >
              Browse All Products
            </button>
          </div>
        )}
      </section>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <section className="relative mx-auto max-w-4xl px-6 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-light/20 blur-3xl"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl"></div>
      </div>

      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light/30 px-4 py-2 mb-4">
          <span className="text-2xl">🕯️</span>
          <p className="text-sm uppercase tracking-[0.3em] text-brand-dark/70 font-semibold">Find Your Perfect Scent</p>
        </div>
        <h1 className="mt-2 font-display text-5xl text-brand-dark bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
          Scent Finder Quiz
        </h1>
        <p className="mt-4 text-lg text-brand-dark/70">
          Answer a few questions and we'll recommend the perfect candles for you
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-brand-dark">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-bold text-brand">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-3 w-full rounded-full bg-brand-light/30 overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500 ease-out shadow-lg relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div
        className={`rounded-3xl border-2 border-brand/20 bg-gradient-to-br from-white to-brand-light/5 p-8 shadow-xl transition-all ${
          isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-display text-brand-dark mb-2">{question.question}</h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-brand to-transparent"></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value)}
                disabled={isTransitioning}
                className={`group relative flex flex-col items-center gap-4 rounded-2xl border-2 p-6 transition-all duration-300 transform ${
                  isSelected
                    ? 'border-brand bg-gradient-to-br from-brand to-brand-dark text-white shadow-xl scale-105 z-10'
                    : 'border-brand/20 bg-white hover:border-brand hover:bg-brand-light/20 hover:shadow-lg hover:scale-105'
                } ${isTransitioning ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand shadow-lg">
                    ✓
                  </div>
                )}
                <span className={`text-5xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {option.icon}
                </span>
                <span className={`font-semibold text-lg ${isSelected ? 'text-white' : 'text-brand-dark'}`}>
                  {option.label}
                </span>
                {!isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-transparent to-brand/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back Button */}
      {currentQuestion > 0 && !isTransitioning && (
        <div className="mt-8 text-center animate-fade-in">
          <button
            onClick={() => {
              setCurrentQuestion(currentQuestion - 1);
              setAnswers(answers.slice(0, -1));
            }}
            className="group flex items-center gap-2 text-sm font-medium text-brand-dark/70 transition hover:text-brand"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            Previous Question
          </button>
        </div>
      )}

      {/* Fun fact or tip */}
      {!isTransitioning && (
        <div className="mt-8 rounded-xl border border-brand/10 bg-brand-light/10 p-4 text-center">
          <p className="text-sm text-brand-dark/70">
            <span className="font-semibold text-brand">💡 Tip:</span>{' '}
            {currentQuestion === 0 && "There's no wrong answer—choose what feels right for you!"}
            {currentQuestion === 1 && 'Think about where you spend most of your time relaxing.'}
            {currentQuestion === 2 && 'Different scents work better at different times of day.'}
            {currentQuestion === 3 && 'Your scent preference often reflects your personality!'}
            {currentQuestion === 4 && 'Almost done! Your perfect scents are just one click away.'}
          </p>
        </div>
      )}
    </section>
  );
};

