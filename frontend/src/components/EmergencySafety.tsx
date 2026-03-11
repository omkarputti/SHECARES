import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Phone, Users, Loader } from "lucide-react";
import SOSModal from "./SOSModal";

const EmergencySafety = () => {
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOSClick = () => {
    setLoading(true);
    setIsSOSModalOpen(true);
    setLoading(false);
  };

  const handleCloseSOSModal = () => {
    setIsSOSModalOpen(false);
  };

  return (
    <section className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-center gap-3 mb-4"> 
        <Shield className="h-6 w-6 text-destructive" />
        <h3 className="text-xl font-semibold">Emergency Safety</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Phone className="h-4 w-4" />
              SOS Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={handleSOSClick}
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loader className="animate-spin" /> : "Emergency SOS"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-sm text-muted-foreground text-center"> 
        <p className="flex items-center justify-center gap-2">
          <Users className="h-4 w-4" />
          Emergency contacts and location sharing are active for your safety.
        </p>
      </div>
      
      {isSOSModalOpen && (
        <SOSModal
          isOpen={isSOSModalOpen}
          onClose={handleCloseSOSModal}
        />
      )}
    </section>
  );
};

export default EmergencySafety;