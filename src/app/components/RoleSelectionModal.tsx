import { useState } from "react";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelect: (role: string) => void;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  onRoleSelect,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("");

  const handleSubmit = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
        <div>
            <label htmlFor="role-select" className="sr-only">
                Choose a role
            </label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option value="" disabled>
            Choose a role
          </option>
          <option value="Investment Banking (IB)">Investment Banking</option>
          <option value="Private Equity (PE)">Private Equity</option>
          <option value="Hedge Funds (HF)">Hedge Funds</option>
          <option value="Equity Research (ER)">Equity Research</option>
          <option value="Asset Management (AM)">Asset Management</option>
          <option value="Corporate Finance (CF)">Corporate Finance</option>
        </select>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;