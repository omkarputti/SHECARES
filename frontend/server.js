import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Report = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      incidentType: (document.getElementById("incident-type") as HTMLInputElement)?.value,
      date: (document.getElementById("date") as HTMLInputElement)?.value,
      time: (document.getElementById("time") as HTMLInputElement)?.value,
      location: (document.getElementById("location") as HTMLInputElement)?.value,
      description: (document.getElementById("description") as HTMLTextAreaElement)?.value,
      name: (document.getElementById("name") as HTMLInputElement)?.value,
      phone: (document.getElementById("phone") as HTMLInputElement)?.value,
    };

    try {
      const res = await fetch("http://localhost:5000/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast({
          title: "✅ Report Submitted",
          description:
            "Thank you for your courage. Your report has been submitted securely.",
        });

        // Clear inputs
        (document.getElementById("incident-type") as HTMLInputElement).value = "";
        (document.getElementById("date") as HTMLInputElement).value = "";
        (document.getElementById("time") as HTMLInputElement).value = "";
        (document.getElementById("location") as HTMLInputElement).value = "";
        (document.getElementById("description") as HTMLTextAreaElement).value = "";
        (document.getElementById("name") as HTMLInputElement).value = "";
        (document.getElementById("phone") as HTMLInputElement).value = "";
      } else {
        toast({
          title: "❌ Error",
          description: "Failed to submit the report. Please try again later.",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "⚠️ Network Error",
        description: "Could not connect to the server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Header />
      <div className="mt-20 w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Report an Incident</CardTitle>
            <CardDescription>
              Your voice matters. All reports are treated with confidentiality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="incident-type">Type of Incident</Label>
                <Input
                  id="incident-type"
                  placeholder="e.g., Harassment, Unsafe Environment"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Incident</Label>
                  <Input id="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time of Incident</Label>
                  <Input id="time" type="time" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Street, City, or Online Platform"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the incident in detail..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-4 pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  Provide your contact information for follow-up.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your Name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="e.g., +91 9876543210" required />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Report;
