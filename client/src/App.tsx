import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import MatchRecord from "@/pages/MatchRecord";
import Players from "@/pages/Players";
import PlayerProfile from "@/pages/PlayerProfile";
import Training from "@/pages/Training";
import Profile from "@/pages/Profile";
import Tournaments from "@/pages/Tournaments";
import League from "@/pages/League";
import Analytics from "@/pages/Analytics";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        {(params) => (
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/home" component={Home} />
              <Route path="/match/new" component={MatchRecord} />
              <Route path="/players" component={Players} />
              <Route path="/player/:id" component={PlayerProfile} />
              <Route path="/training-checkin" component={Training} />
              <Route path="/profile" component={Profile} />
              <Route path="/tournaments" component={Tournaments} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/league" component={League} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
