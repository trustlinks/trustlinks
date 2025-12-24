import { useSeoMeta } from '@unhead/react';
import { LoginArea } from "@/components/auth/LoginArea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ReputationFeed } from "@/components/reputation/ReputationFeed";
import { Star, Users, TrendingUp, Shield } from "lucide-react";

const Index = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Nostr Live Reputation - Reputacja na Żywo',
    description: 'Buduj sieć zaufania podczas konferencji i wydarzeń. Nadawaj reputację w czasie rzeczywistym na protokole Nostr.',
  });

  if (user) {
    return <ReputationFeed />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Zbudowane na protokole Nostr
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              Reputacja na{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Żywo
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Buduj sieć zaufania podczas konferencji, meetupów i wydarzeń społeczności.
              Nadawaj reputację w czasie rzeczywistym i odkrywaj wartościowych członków społeczności.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Oceniaj na Żywo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Nadawaj reputację podczas wydarzeń w czasie rzeczywistym
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Web of Trust
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                4-poziomowa sieć zaufania z priorytetem dla Twoich weryfikacji
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Agregacja Inteligentna
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Automatyczna agregacja z priorytetem dla twojej sieci
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 space-y-4">
            <LoginArea className="flex w-full max-w-md mx-auto" />

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Współpracuje z Amethyst i innymi klientami Nostr
            </p>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vibed with{" "}
              <a
                href="https://shakespeare.diy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
              >
                Shakespeare
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
