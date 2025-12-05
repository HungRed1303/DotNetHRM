// Grid 1–2 cột

export default function InfoGrid({ children }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
      {children}
    </div>
  );
}
