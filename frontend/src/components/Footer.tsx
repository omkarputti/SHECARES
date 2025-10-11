const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xl">Vespera</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Your complete women's health companion for pregnancy, periods, mental wellness, and emergency safety.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="/Auth" className="hover:text-primary-foreground transition-colors">Pregnancy Tracking</a></li>
              <li><a href="/Auth" className="hover:text-primary-foreground transition-colors">Period Monitor</a></li>
              <li><a href="/Auth" className="hover:text-primary-foreground transition-colors">Mental Health</a></li>
              <li><a href="/Auth" className="hover:text-primary-foreground transition-colors">Emergency Safety</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Emergency Contacts</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Emergency</h3>
            <div className="space-y-3">
              <div className="bg-destructive/20 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">Crisis Hotline</p>
                <p className="text-sm font-bold">988</p>
              </div>
              <div className="bg-destructive/20 p-3 rounded-lg">
                <p className="text-xs font-medium mb-1">Emergency</p>
                <p className="text-sm font-bold">112</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 mt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © 2025 Vespera. All rights reserved. Team Oscorp
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;