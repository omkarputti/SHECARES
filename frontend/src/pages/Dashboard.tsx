import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, Activity, Users, Apple, Watch } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">Here's your health overview</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Period</CardTitle>
              <Calendar className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 days</div>
              <p className="text-xs text-muted-foreground">Based on your cycle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mental Health</CardTitle>
              <Heart className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Good</div>
              <p className="text-xs text-muted-foreground">Last check-in today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activity</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7,582</div>
              <p className="text-xs text-muted-foreground">Steps today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Caretakers</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Connected</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Period Tracking</CardTitle>
              <CardDescription>Track your cycle and get predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/periods">
                <Button className="w-full">View Cycle</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Pregnancy Care</CardTitle>
              <CardDescription>Due date calculator and trimester tips</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/pregnancy">
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Activity className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Mental Health</CardTitle>
              <CardDescription>Get support and connect with therapists</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/mental-health">
                <Button className="w-full">Check In</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Caretaker Module</CardTitle>
              <CardDescription>Manage your support network</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/caretaker">
                <Button className="w-full">Manage</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Watch className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Wearable Connect</CardTitle>
              <CardDescription>Sync your fitness devices</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/wearable">
                <Button className="w-full">Connect Device</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Apple className="h-8 w-8 text-accent mb-2" />
              <CardTitle>Food Analyzer</CardTitle>
              <CardDescription>Track nutrition and get recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/food-analyzer">
                <Button className="w-full">Analyze Food</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
