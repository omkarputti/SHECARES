
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mockTherapists = [
  { id: 1, name: 'Dr. Emily Carter', specialty: 'Cognitive Behavioral Therapy', location: 'New York, NY' },
  { id: 2, name: 'Dr. Benjamin Hayes', specialty: 'Anxiety & Stress Management', location: 'Chicago, IL' },
  { id: 3, name: 'Dr. Olivia Chen', specialty: 'Trauma & PTSD', location: 'San Francisco, CA' },
  { id: 4, name: 'Dr. Marcus Reid', specialty: 'Family & Relationship Counseling', location: 'Austin, TX' },
];

const mockDoctors = [
  { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'General Practitioner', location: 'Los Angeles, CA' },
  { id: 2, name: 'Dr. Michael Alvarez', specialty: 'OB/GYN', location: 'Miami, FL' },
  { id: 3, name: 'Dr. Jessica Lee', specialty: 'Dermatologist', location: 'Seattle, WA' },
  { id: 4, name: 'Dr. David Kim', specialty: 'Cardiologist', location: 'Boston, MA' },
];

const FindProfessional = () => {
  const { type } = useParams<{ type: 'therapist' | 'doctor' }>();
  const [searchTerm, setSearchTerm] = useState('');
  
  const isTherapist = type === 'therapist';
  const title = isTherapist ? 'Find a Therapist' : 'Find a Doctor';
  const data = isTherapist ? mockTherapists : mockDoctors;

  const filteredData = data.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl text-center bg-gradient-primary bg-clip-text text-transparent">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Search by name, specialty, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {filteredData.map(professional => (
              <Card key={professional.id}>
                <CardHeader>
                  <CardTitle>{professional.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground">{professional.specialty}</p>
                  <p className="text-sm text-gray-500">{professional.location}</p>
                   <Button className="w-full mt-4" onClick={() => alert(`Navigating to booking for ${professional.name}`)}>
                    Book a Session
                  </Button>
                </CardContent>
              </Card>
            ))}
             {filteredData.length === 0 && (
              <p className="text-center text-muted-foreground md:col-span-2">
                No professionals found matching your search.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FindProfessional;
