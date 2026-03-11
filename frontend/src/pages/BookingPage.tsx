
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const BookingPage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>();
  const { toast } = useToast();

  const availableTimes = [
    "09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"
  ];

  const handleBooking = () => {
    if (date && time) {
      const meetLink = "https://meet.google.com/new";

      toast({
        title: "Booking Confirmed!",
        description: `Your session is booked for ${date.toLocaleDateString()} at ${time}.`,
        action: (
          <a href={meetLink} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">Join Meet</Button>
          </a>
        ),
      });
    } else {
      toast({
        title: "Booking Failed",
        description: "Please select a date and time for your session.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Book a Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <p className="font-semibold">1. Select a Date</p>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </div>

              <div className="flex flex-col items-center space-y-2">
                <p className="font-semibold">2. Select a Time</p>
                <Select onValueChange={setTime} value={time}>
                  <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleBooking} className="w-full">Confirm Booking</Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingPage;
