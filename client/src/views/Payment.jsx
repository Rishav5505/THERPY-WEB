import React, { useState } from "react";
import { motion } from "framer-motion";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

import { useNavigate } from "react-router-dom";

const Payment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Success state
  const [paymentMethod, setPaymentMethod] = useState("online");
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsLoading(true);

    // 1. Pay at Clinic Flow
    if (paymentMethod === "clinic") {
      setTimeout(() => {
        setIsLoading(false);
        setIsSuccess(true); // Show success view
        setTimeout(() => navigate("/patient"), 3000); // Redirect after 3s
      }, 1500);
      return;
    }

    // 2. Online Payment Flow (Razorpay)
    const res = await loadRazorpayScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsLoading(false);
      return;
    }

    const options = {
      key: "rzp_test_1DP5mmOlF5G5ag", // Dummy Razorpay test key
      amount: 50000,
      currency: "INR",
      name: "MindMend",
      description: "Premium Therapy Session",
      image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
      handler: function (response) {
        // SUCCESS HANDLER
        setIsLoading(false);
        setIsSuccess(true);
        setTimeout(() => navigate("/patient"), 3000);
      },
      prefill: {
        name: "Valued Patient",
        email: "patient@mindmend.com",
        contact: "9999999999",
      },
      theme: {
        color: "#6366f1",
      },
      modal: {
        ondismiss: function () {
          setIsLoading(false);
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // SUCCESS VIEW
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0b0f1a] pt-32 pb-20 px-6 flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass p-12 rounded-[3rem] shadow-2xl text-center border-2 border-green-100 dark:border-green-900"
        >
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 text-green-600">
            ✓
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Confirmed!</h2>
          <p className="text-slate-500 mb-8">Your appointment has been successfully scheduled. Redirecting back to home...</p>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3 }}
              className="h-full bg-green-500"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] pt-32 pb-20 px-6 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass p-12 rounded-[3rem] shadow-2xl shadow-indigo-500/10 text-center border-2 border-indigo-50 dark:border-slate-800"
      >
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">
          {paymentMethod === 'online' ? '💳' : '🏥'}
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Secure Checkout</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-10 italic">
          "Your health is an investment, not an expense."
        </p>

        {/* PAYMENT METHOD TOGGLE */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setPaymentMethod("online")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === "online"
              ? "bg-white dark:bg-slate-700 shadow-md text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Pay Online
          </button>
          <button
            onClick={() => setPaymentMethod("clinic")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${paymentMethod === "clinic"
              ? "bg-white dark:bg-slate-700 shadow-md text-indigo-600"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            Pay at Clinic
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Consultation Fee</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">₹500.00</span>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Service Charge</span>
            <span className="text-sm font-bold text-emerald-500">FREE</span>
          </div>
          <div className="h-[1px] bg-slate-200 dark:bg-slate-700 mb-6" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Total Amount</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹500</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          onClick={handlePayment}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            paymentMethod === 'online' ? "Confirm & Pay Now" : "Confirm Appointment"
          )}
        </motion.button>

        <div className="mt-8 flex items-center justify-center gap-4 opacity-50">
          <div className="h-[1px] flex-1 bg-slate-300" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {paymentMethod === 'online' ? 'Secured by Razorpay' : 'Pay via Cash/Card at Clinic'}
          </span>
          <div className="h-[1px] flex-1 bg-slate-300" />
        </div>
      </motion.div>
    </div>
  );
};

export default Payment;
