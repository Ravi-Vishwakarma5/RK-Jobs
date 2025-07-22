// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from 'next/navigation';

// export default function FreeUserLogin() {
//     const router=useRouter()
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
//   const [message, setMessage] = useState("");
//   const [token, setToken] = useState("");

//   const validate = () => {
//     const newErrors: { email?: string; password?: string } = {};

//     if (!formData.email) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = "Email format is invalid";
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!validate()) return;

//     try {
//       const res = await fetch("/api/freeuser/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage("✅ Login successful");
//         setToken(data.token);
//         localStorage.setItem("free_token", data.token);
//         router.push("/home")
//       } else {
//         setMessage(data.message || "❌ Login failed");
//       }
//     } catch (error) {
//       setMessage("❌ Something went wrong");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
//         <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-6">Free User Login</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <input
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             />
//             {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
//           </div>

//           <div>
//             <input
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             />
//             {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
//           >
//             Login
//           </button>

//           <div className="text-center mt-2 text-sm text-gray-600">
//             Not registered yet?{" "}
//             <Link href="/freeregister" className="text-indigo-600 font-medium hover:underline">
//               Register here
//             </Link>
//           </div>
//         </form>

//         {message && (
//           <p
//             className={`mt-4 text-center text-sm font-medium ${
//               message.includes("success") ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {message}
//           </p>
//         )}

      
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function FreeUserLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("free_token");
    if (token) {
      router.push("/home");
    }
  }, [router]);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/freeuser/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("free_token", data.token);
        setMessage("✅ Login successful");
        router.push("/home");
      } else {
        setMessage(data.message || "❌ Login failed");
      }
    } catch (error) {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-indigo-700 mb-6">Free User Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-indigo-600 text-white py-2 rounded-lg transition duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-2 text-sm text-gray-600">
            Not registered yet?{" "}
            <Link href="/freeregister" className="text-indigo-600 font-medium hover:underline">
              Register here
            </Link>
          </div>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.includes("success") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
