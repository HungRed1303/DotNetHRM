import React, { useState } from "react";
import { useParams } from "react-router-dom";

import Card from "../../components/profile/ProfileCard";
import InfoGrid from "../../components/profile/InfoGrid";
import Field from "../../components/profile/Field";
import SecureRow from "../../components/profile/SecureField";
import ProfileSidebar from "../../components/profile/ProfileSidebar";
import ProfileSkeleton from "../../components/profile/ProfileSkeleton";

import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
         HiOutlineOfficeBuilding, HiOutlineCalendar } from "react-icons/hi";

import { THEME_COLORS } from "../../components/common/THEME_COLORS";
import { useEmployeeProfile } from "../../hooks/useEmployeeProfile";

const fdate = (v?: string | number | Date) =>
  v ? new Date(v).toLocaleDateString("vi-VN") : "-";

export default function ProfilePage() {
  const { id } = useParams();
  const { data, loading, err } = useEmployeeProfile(id);
  const [show, setShow] = useState<Record<string, boolean>>({});

  if (loading)
    return (
      <div className="min-h-screen p-10 bg-gray-50">
        <ProfileSkeleton />
      </div>
    );

  if (err || !data)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-700">
        {err}
      </div>
    );

  return (
    <div
      className="min-h-screen p-10 font-sans text-gray-900"
      style={{ backgroundColor: THEME_COLORS.secondary[50] }}
    >
      <div className="max-w-7xl mx-auto flex gap-10">
        <ProfileSidebar data={data} />

        <section className="flex-1 flex flex-col gap-8">
          {/* Thông tin cơ bản */}
          <Card title="Thông tin cơ bản" icon={<HiOutlineUser />}>
            <InfoGrid>
              <Field label="Mã nhân viên" icon={<HiOutlineUser />}>
                {data.employeeCode}
              </Field>

              <Field label="Email" icon={<HiOutlineMail />}>
                {data.email}
              </Field>

              <Field label="Số điện thoại" icon={<HiOutlinePhone />}>
                {data.phone}
              </Field>

              <Field label="Địa chỉ" icon={<HiOutlineLocationMarker />}>
                {data.address}
              </Field>
            </InfoGrid>
          </Card>

          {/* Bảo mật */}
          <Card title="Bảo mật" icon={<HiOutlineUser />}>
            <InfoGrid>
              <SecureRow
                label="Số CCCD"
                value={data.citizenId}
                show={!!show.cccd}
                onToggle={() => setShow((p) => ({ ...p, cccd: !p.cccd }))}
              />

              <SecureRow
                label="Mã số thuế"
                value={data.taxCode}
                show={!!show.tax}
                onToggle={() => setShow((p) => ({ ...p, tax: !p.tax }))}
              />

              {data.bankAccount && (
                <SecureRow
                  label="Tài khoản ngân hàng"
                  value={data.bankAccount.accountNumber}
                  show={!!show.bank}
                  onToggle={() => setShow((p) => ({ ...p, bank: !p.bank }))}
                />
              )}
            </InfoGrid>
          </Card>

          {/* Công việc */}
          <Card title="Công việc" icon={<HiOutlineOfficeBuilding />}>
            <InfoGrid>
              <Field label="Phòng ban">{data.department}</Field>

              <Field label="Chức vụ">{data.position}</Field>

              <Field label="Ngày vào làm" icon={<HiOutlineCalendar />}>
                {fdate(data.joinDate)}
              </Field>

              <Field label="Ngày sinh" icon={<HiOutlineCalendar />}>
                {fdate(data.birthDate)}
              </Field>
            </InfoGrid>
          </Card>
        </section>
      </div>
    </div>
  );
}
