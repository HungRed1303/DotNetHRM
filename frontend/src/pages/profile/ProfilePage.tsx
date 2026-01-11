import { useParams } from "react-router-dom";
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile";
import { useSecureFieldToggle } from "../../hooks/useSecureFieldToggle";
import { useUpdateEmployeeInfo } from "../../hooks/useUpdateEmployeeInfo";
import type { UpdateEmployeeFormData } from "../../hooks/useUpdateEmployeeInfo";
import ProfileLayout from "../../layouts/ProfileLayout";
import ProfileContent from "../../components/profile/ProfileContent";
import ProfileSkeleton from "../../components/profile/ProfileSkeleton";
import UpdateEmployeePersonalInformation from "../../components/profile/UpdateProfileEmployee";
import { useState } from "react";

export default function ProfilePage() {
  const { id } = useParams();
  const { data, loading, err, refetch } = useEmployeeProfile(id);
  const { toggle, isVisible } = useSecureFieldToggle();

  const { handleUpdateSubmit, isSubmitting } = useUpdateEmployeeInfo();

  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const onSubmitAndRefresh = async (formData: UpdateEmployeeFormData) => {
  await handleUpdateSubmit(formData);
  await refetch();
  setShowUpdateForm(false);
};

  // console.log("Employee Data:", data);

  // Loading state
  if (loading) {
    return (
      <ProfileLayout>
        <div className="flex-1 flex items-center justify-center">
          <ProfileSkeleton />
        </div>
      </ProfileLayout>
    );
  }

  // Error state
  if (err || !data) {
    return (
      <ProfileLayout>
        <div className="flex-1 flex items-center justify-center">
          {err || "Không tìm thấy dữ liệu"}
        </div>
      </ProfileLayout>
    );
  }

  // Success state
  return (
    <ProfileLayout>
      <ProfileContent
        data={data}
        showCccd={isVisible("cccd")}
        showBank={isVisible("bank")}
        showTax={isVisible("tax")}
        onToggleCccd={() => toggle("cccd")}
        onToggleBank={() => toggle("bank")}
        onToggleTax={() => toggle("tax")}
        onUpdateClick={() => setShowUpdateForm(true)}
      />

      {showUpdateForm && (
        <UpdateEmployeePersonalInformation
          employeeId={Number(data.id)}
          isOpen={showUpdateForm}
          onClose={() => setShowUpdateForm(false)}
          onSubmit={onSubmitAndRefresh}
          isSubmitting={isSubmitting}
        />
      )}
    </ProfileLayout>
  );
}
