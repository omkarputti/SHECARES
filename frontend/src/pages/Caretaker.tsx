import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Phone, Mail, Shield, Trash2 } from "lucide-react";
import { useState } from "react";

const Caretaker = () => {
  const [caretakers, setCaretakers] = useState([
    { id: 1, name: "Sarah Johnson", email: "sarah@example.com", phone: "+1234567890", relation: "Mother" },
    { id: 2, name: "Dr. Emily Davis", email: "emily@clinic.com", phone: "+1234567891", relation: "Doctor" },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Caretaker Module</h1>
          <p className="text-muted-foreground">Manage your trusted support network</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add New Caretaker */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Add Caretaker
              </CardTitle>
              <CardDescription>Add someone to your support network</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="Enter phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="relation">Relationship</Label>
                <Input id="relation" placeholder="e.g., Mother, Doctor" />
              </div>
              <Button className="w-full">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Caretaker
              </Button>
            </CardContent>
          </Card>

          {/* Current Caretakers */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Support Network</CardTitle>
                <CardDescription>
                  These people can receive emergency alerts and health updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {caretakers.map((caretaker) => (
                  <Card key={caretaker.id} className="bg-secondary/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{caretaker.name}</h3>
                            <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                              {caretaker.relation}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {caretaker.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              {caretaker.phone}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-accent/10 border-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Emergency Settings
                </CardTitle>
                <CardDescription>
                  Configure how caretakers are notified during emergencies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Emergency Alert Method</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">SMS</Button>
                    <Button variant="outline" className="flex-1">Email</Button>
                    <Button variant="outline" className="flex-1">Both</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Share Location During Emergency</Label>
                  <Button variant="outline" className="w-full justify-start">
                    Enabled - Real-time GPS tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Caretaker;
