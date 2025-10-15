import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Watch, Activity, Heart, Footprints, Moon, Flame, CheckCircle2, Link2, Smartphone, Wifi, WifiOff } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = () => {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50 shadow-sm"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
            <span className="text-white font-bold text-lg">SH</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent">
            SHECARES
          </span>
        </motion.div>
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Features", "Help", "Contact Info"].map((item, i) => (
            <motion.a 
              key={item}
              href="#" 
              className="text-gray-700 hover:text-pink-500 transition-colors"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {item}
            </motion.a>
          ))}
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white rounded-full px-8 shadow-lg">
            Get Started
          </Button>
        </motion.div>
      </div>
    </motion.nav>
  );
};

const Wearable = () => {
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [healthData, setHealthData] = useState({
    steps: 0,
    heartRate: 0,
    sleep: 0,
    calories: 0
  });

  // Simulate real-time health data updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (connectedDevices.length > 0) {
        setHealthData(prev => ({
          steps: Math.min(prev.steps + Math.floor(Math.random() * 50), 15000),
          heartRate: 65 + Math.floor(Math.random() * 15),
          sleep: Math.min(prev.sleep + 1, 100),
          calories: Math.min(prev.calories + Math.floor(Math.random() * 10), 3000)
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [connectedDevices]);

  const connectDevice = async (deviceName) => {
    setIsConnecting(true);
    
    // Check if Google Fit or Health Connect is available
    if ('NDEFReader' in window || navigator.bluetooth) {
      try {
        // Request Bluetooth device (for real wearables)
        if (navigator.bluetooth) {
          const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['heart_rate', 'battery_service']
          });
          
          const newDevice = {
            id: Date.now(),
            name: deviceName,
            type: "Smartwatch",
            status: "Connected",
            lastSync: "Just now",
            batteryLevel: Math.floor(Math.random() * 40) + 60
          };
          
          setConnectedDevices([...connectedDevices, newDevice]);
          setHealthData({
            steps: Math.floor(Math.random() * 5000) + 3000,
            heartRate: Math.floor(Math.random() * 20) + 65,
            sleep: Math.floor(Math.random() * 30) + 70,
            calories: Math.floor(Math.random() * 1000) + 1000
          });
        }
      } catch (error) {
        console.log("Bluetooth not selected or not available");
        // Fallback to simulation
        simulateConnection(deviceName);
      }
    } else {
      // Simulate connection if APIs not available
      simulateConnection(deviceName);
    }
    
    setTimeout(() => setIsConnecting(false), 2000);
  };

  const simulateConnection = (deviceName) => {
    const newDevice = {
      id: Date.now(),
      name: deviceName,
      type: "Smartwatch",
      status: "Connected",
      lastSync: "Just now",
      batteryLevel: Math.floor(Math.random() * 40) + 60
    };
    
    setConnectedDevices([...connectedDevices, newDevice]);
    setHealthData({
      steps: Math.floor(Math.random() * 5000) + 3000,
      heartRate: Math.floor(Math.random() * 20) + 65,
      sleep: Math.floor(Math.random() * 30) + 70,
      calories: Math.floor(Math.random() * 1000) + 1000
    });
  };

  const syncDevice = async (deviceId) => {
    setSyncStatus("syncing");
    // Simulate sync with backend
    setTimeout(() => {
      setConnectedDevices(devices =>
        devices.map(d =>
          d.id === deviceId ? { ...d, lastSync: "Just now" } : d
        )
      );
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 2000);
    }, 2000);
  };

  const disconnectDevice = (deviceId) => {
    setConnectedDevices(devices => devices.filter(d => d.id !== deviceId));
    if (connectedDevices.length === 1) {
      setHealthData({ steps: 0, heartRate: 0, sleep: 0, calories: 0 });
    }
  };

  const availableDevices = [
    { name: "Apple Watch", icon: Watch, description: "Track steps, heart rate, and sleep", color: "from-gray-700 to-black" },
    { name: "Fitbit", icon: Activity, description: "Track steps, heart rate, and sleep", color: "from-teal-500 to-cyan-600" },
    { name: "Garmin", icon: Activity, description: "Advanced fitness and health metrics", color: "from-blue-500 to-blue-700" },
    { name: "Samsung Galaxy Watch", icon: Watch, description: "Comprehensive health monitoring", color: "from-purple-500 to-purple-700" },
  ];

  const healthMetrics = [
    { label: "Steps Today", value: healthData.steps.toLocaleString(), icon: Footprints, color: "from-pink-400 to-pink-600", bgColor: "from-pink-50 to-pink-100" },
    { label: "Heart Rate", value: `${healthData.heartRate} bpm`, icon: Heart, color: "from-rose-400 to-rose-600", bgColor: "from-rose-50 to-rose-100" },
    { label: "Sleep Score", value: `${healthData.sleep}/100`, icon: Moon, color: "from-purple-400 to-purple-600", bgColor: "from-purple-50 to-purple-100" },
    { label: "Calories", value: healthData.calories.toLocaleString(), icon: Flame, color: "from-fuchsia-400 to-fuchsia-600", bgColor: "from-fuchsia-50 to-fuchsia-100" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 to-fuchsia-600 bg-clip-text text-transparent mb-2">
            Wearable Connect
          </h1>
          <p className="text-gray-600 text-lg">Sync your fitness devices and track your health metrics in real-time</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {healthMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-xl hover:shadow-2xl transition-all rounded-3xl overflow-hidden relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${metric.bgColor} opacity-50`}></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-gray-700">{metric.label}</CardTitle>
                  <motion.div 
                    className={`p-3 bg-gradient-to-br ${metric.color} rounded-2xl shadow-lg`}
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.2 
                    }}
                  >
                    <metric.icon className="h-5 w-5 text-white" />
                  </motion.div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <motion.div 
                    className="text-3xl font-bold text-gray-800"
                    key={metric.value}
                    initial={{ scale: 1.2, color: "#ec4899" }}
                    animate={{ scale: 1, color: "#1f2937" }}
                    transition={{ duration: 0.3 }}
                  >
                    {metric.value}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-xl rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-gray-800 flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-pink-500" />
                  Connected Devices
                </CardTitle>
                <CardDescription className="text-gray-600">Manage your synced wearable devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatePresence>
                  {connectedDevices.map((device) => (
                    <motion.div
                      key={device.id}
                      initial={{ opacity: 0, x: -20, rotateY: -15 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0, x: 20, rotateY: 15 }}
                      whileHover={{ scale: 1.02, rotateY: 2 }}
                      style={{ transformStyle: "preserve-3d" }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <Card className="bg-gradient-to-br from-pink-50 via-white to-purple-50 border-pink-200 shadow-lg rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
                        <CardContent className="pt-6 relative z-10">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <motion.div 
                                className="p-4 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-2xl shadow-xl"
                                animate={{ 
                                  boxShadow: ["0 10px 30px rgba(236, 72, 153, 0.3)", "0 15px 40px rgba(236, 72, 153, 0.5)", "0 10px 30px rgba(236, 72, 153, 0.3)"]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Watch className="h-7 w-7 text-white" />
                              </motion.div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-gray-800 text-lg">{device.name}</h3>
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                  >
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  </motion.div>
                                </div>
                                <p className="text-sm text-gray-600">{device.type}</p>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-gray-500">Last synced: {device.lastSync}</span>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                    🔋 {device.batteryLevel}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-pink-300 text-pink-600 hover:bg-pink-50 rounded-full"
                                  onClick={() => syncDevice(device.id)}
                                  disabled={syncStatus === "syncing"}
                                >
                                  {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-red-500 hover:bg-red-50 rounded-full"
                                  onClick={() => disconnectDevice(device.id)}
                                >
                                  Disconnect
                                </Button>
                              </motion.div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {connectedDevices.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <WifiOff className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No devices connected. Connect a device below to get started!</p>
                  </motion.div>
                )}

                <div className="pt-4">
                  <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-pink-500" />
                    Available Devices
                  </h3>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {availableDevices.map((device, index) => (
                      <motion.div
                        key={device.name}
                        variants={itemVariants}
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 5,
                          z: 50
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <Card className="bg-white border-pink-100 hover:shadow-2xl transition-all rounded-2xl overflow-hidden">
                          <div className={`h-2 bg-gradient-to-r ${device.color}`}></div>
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3 mb-4">
                              <motion.div 
                                className={`p-3 bg-gradient-to-br ${device.color} rounded-xl shadow-lg`}
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                              >
                                <device.icon className="h-6 w-6 text-white" />
                              </motion.div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{device.name}</h4>
                                <p className="text-xs text-gray-600 mt-1">{device.description}</p>
                              </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full border-pink-300 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-fuchsia-600 hover:text-white rounded-full transition-all"
                                onClick={() => connectDevice(device.name)}
                                disabled={isConnecting}
                              >
                                <Link2 className="mr-2 h-4 w-4" />
                                {isConnecting ? "Connecting..." : "Connect"}
                              </Button>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-pink-100 shadow-xl rounded-3xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-gray-800">Sync Settings</CardTitle>
                <CardDescription className="text-gray-600">Configure data synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Auto-Sync Data</h4>
                  <div className="space-y-2">
                    {[
                      { icon: Activity, label: "Activity & Steps", color: "text-pink-500" },
                      { icon: Heart, label: "Heart Rate", color: "text-rose-500" },
                      { icon: Moon, label: "Sleep Data", color: "text-purple-500" },
                      { icon: Flame, label: "Calories", color: "text-fuchsia-500" }
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        whileHover={{ x: 5 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button variant="outline" className="w-full justify-start border-pink-200 hover:bg-pink-50 rounded-full hover:shadow-md transition-all" size="sm">
                          <item.icon className={`mr-2 h-4 w-4 ${item.color}`} />
                          <span className="text-gray-700">{item.label}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-pink-100">
                  <h4 className="text-sm font-medium text-gray-700">Sync Frequency</h4>
                  <div className="space-y-2">
                    {["Real-time", "Every hour", "Manual only"].map((freq, index) => (
                      <motion.div
                        key={freq}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Button variant="outline" className="w-full border-pink-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 rounded-full" size="sm">
                          <span className="text-gray-700">{freq}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div 
                  className="pt-4 border-t border-pink-100"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all">
                    Save Preferences
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Wearable;