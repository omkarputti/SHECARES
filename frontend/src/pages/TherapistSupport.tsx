
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Stethoscope } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TherapistSupport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-primary bg-clip-text text-transparent">Professional Support</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Connect with therapists and doctors for your well-being.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Therapist Support
                </CardTitle>
                <CardDescription>
                  Connect with licensed therapists and mental health professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate('/find/therapist')}>Find a Therapist</Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/booking')}>Book Session</Button>
                  <a href="tel:988" className="w-full inline-block">
                    <Button variant="outline" className="w-full">Crisis Hotline</Button>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Doctor Connect
                </CardTitle>
                <CardDescription>
                  Consult with doctors and medical professionals for your health needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate('/find/doctor')}>Find a Doctor</Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/booking')}>Book Appointment</Button>
                  <a href="tel:911" className="w-full inline-block">
                    <Button variant="outline" className="w-full">Emergency Services</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TherapistSupport;
