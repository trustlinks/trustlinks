import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSearch } from "./UserSearch";
import { GiveReputationDialog } from "./GiveReputationDialog";
import { MyReputationList } from "./MyReputationList";
import { ReceivedReputationList } from "./ReceivedReputationList";
import { LoginArea } from "@/components/auth/LoginArea";
import { Star, TrendingUp, Users, Search } from "lucide-react";

export function ReputationFeed() {
  const { user } = useCurrentUser();
  const [selectedTab, setSelectedTab] = useState("search");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Zaloguj się, aby kontynuować</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginArea className="flex w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Live Reputation
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Zarządzaj swoją siecią zaufania
                </p>
              </div>
            </div>
            <LoginArea className="max-w-60" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Szukaj</span>
            </TabsTrigger>
            <TabsTrigger value="given" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Nadane</span>
            </TabsTrigger>
            <TabsTrigger value="received" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Otrzymane</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  Znajdź użytkownika
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserSearch />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="given" className="space-y-6">
            <MyReputationList userPubkey={user.pubkey} />
          </TabsContent>

          <TabsContent value="received" className="space-y-6">
            <ReceivedReputationList userPubkey={user.pubkey} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
