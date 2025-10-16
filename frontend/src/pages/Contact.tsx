import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  Building,
  Users,
  Heart
} from "lucide-react";
import Header from "@/components/Header";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-purple-200">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Header />
        <br></br>
        <br></br>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Contact SheCares
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mt-3">
            We’re here to support your wellness journey — whether it’s technical help, partnership opportunities, or just a question about how SheCares can empower you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-600">
                  <Building className="h-5 w-5" />
                  <span>Head Office</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <p className="font-semibold">Address</p>
                    <p>
                      SheCares Wellness Technologies Pvt. Ltd.<br />
                      Harmony Tower, Sector 15<br />
                      Bengaluru, Karnataka 560001<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p>+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p>hello@shecares.in</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-pink-500 mt-1" />
                  <div>
                    <p className="font-semibold">Office Hours</p>
                    <p>
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Contacts */}
            <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-600">
                  <Users className="h-5 w-5" />
                  <span>Team Contacts</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <div className="grid gap-4">
                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="font-semibold text-pink-700">Technical Support</p>
                    <p className="text-sm">support@shecares.in</p>
                  </div>

                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="font-semibold text-pink-700">Medical & Wellness Partners</p>
                    <p className="text-sm">partners@shecares.in</p>
                  </div>

                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="font-semibold text-pink-700">Research & Innovation</p>
                    <p className="text-sm">research@shecares.in</p>
                  </div>

                  <div className="p-3 bg-pink-50 rounded-lg">
                    <p className="font-semibold text-pink-700">Media & Outreach</p>
                    <p className="text-sm">media@shecares.in</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>24/7 Emergency Support</span>
                </CardTitle>
                <CardDescription className="text-white/80">
                  For immediate help during critical situations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span className="font-semibold">+91 99887 77665</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-semibold">emergency@shecares.in</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-600">Send us a Message</CardTitle>
              <CardDescription className="text-gray-600">
                We’ll get back to you within 24 hours with the care you deserve.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+91 98765 43210" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <select 
                    id="subject"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-pink-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="">Select a subject</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="research">Research Collaboration</option>
                    <option value="media">Media Inquiry</option>
                    <option value="general">General Question</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Tell us how we can help you..."
                    className="min-h-[120px] bg-pink-50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="consent" className="rounded border-gray-400" />
                  <Label htmlFor="consent" className="text-sm text-gray-600">
                    I agree to receive communications from SheCares and understand I can unsubscribe anytime.
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Location Map Placeholder */}
        <Card className="bg-white/70 backdrop-blur-md border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="text-pink-600">Find Us</CardTitle>
            <CardDescription className="text-gray-600">
              Our wellness hub in Bengaluru, India
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-pink-600" />
                <p className="text-gray-700">Interactive Map</p>
                <p className="text-sm text-gray-600">SheCares Technologies, Bengaluru</p>
              </div>
            </div>
            <footer />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
