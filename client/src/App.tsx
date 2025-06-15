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
      <Route path="/" component={() => <Layout><Home /></Layout>} />
      <Route path="/home" component={() => <Layout><Home /></Layout>} />
      <Route path="/match/new" component={() => <Layout><MatchRecord /></Layout>} />
      <Route path="/players" component={() => <Layout><Players /></Layout>} />
      <Route path="/player/:id" component={() => <Layout><PlayerProfile /></Layout>} />
      <Route path="/training-checkin" component={() => <Layout><Training /></Layout>} />
      <Route path="/profile" component={() => <Layout><Profile /></Layout>} />
      <Route path="/tournaments" component={() => <Layout><Tournaments /></Layout>} />
      <Route path="/analytics" component={() => <Layout><Analytics /></Layout>} />
      <Route path="/league" component={() => <Layout><League /></Layout>} />
      <Route component={NotFound} />
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
