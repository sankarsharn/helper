"use client";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import RoleSelectionModal from "../components/RoleSelectionModal";
import { updateUserRole } from "@/app/login/userAuth";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const role = userDoc.data().role;
          setUserRole(role);

          // Show modal only if role is null
          if (role === null) {
            setIsModalOpen(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelect = async (role: string) => {
    if (auth.currentUser) {
      await updateUserRole(auth.currentUser.uid, role);
      setUserRole(role); // Update local state
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Your current role: {userRole || "Not set"}</p>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleSelect={handleRoleSelect}
      />
    </div>
  );
};

export default Dashboard;