import { useState, useRef } from "react";
import { Search, Award, Upload } from "lucide-react";
import Header from "../../components/LandingPage/Header";
import Sidebar from "../../components/common/Sidebar";
import Footer from "../../components/LandingPage/Footer";
import ResultFilterChips from "./components/ResultFilterChips";
import ProgressBar from "./components/ProgressBar";
import BulkActionBar from "./components/BulkActionBar";
import ResultTable, { type ParticipantResult } from "./components/ResultTable";

export default function ActivityResultPage() {
  const [selectedActivity, setSelectedActivity] = useState("marathon2024");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Chưa nhập");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [participants, setParticipants] = useState<ParticipantResult[]>([
    {
      id: "1",
      name: "Nguyễn Văn An",
      code: "NVA001",
      score: 95,
      rank: 1,
      rating: "Xuất sắc",
      hasEvidence: true,
      completed: true,
    },
    {
      id: "2",
      name: "Trần Thị Bình",
      code: "TTB002",
      score: 88,
      rank: 2,
      rating: "Tốt",
      hasEvidence: true,
      completed: true,
    },
    {
      id: "3",
      name: "Lê Văn Cường",
      code: "LVC003",
      score: null,
      rank: null,
      rating: "",
      hasEvidence: false,
      completed: false,
    },
    {
      id: "4",
      name: "Hoàng Văn Em",
      code: "HVE005",
      score: null,
      rank: null,
      rating: "",
      hasEvidence: false,
      completed: false,
    },
    {
      id: "5",
      name: "Thành Tú",
      code: "TH006",
      score: null,
      rank: null,
      rating: "",
      hasEvidence: false,
      completed: false,
    },
  ]);

  const handleScoreChange = (id: string, score: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, score } : p))
    );
  };

  const handleRatingChange = (id: string, rating: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rating } : p))
    );
  };

  const handleRankChange = (id: string, rank: number) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rank } : p))
    );
  };

  const handleUploadEvidence = (id: string) => {
    // TODO: Implement file upload
    alert(`Upload minh chứng cho ${participants.find((p) => p.id === id)?.name}`);
  };

  const handleSelectChange = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((i) => i !== id)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredParticipants.map((p) => p.id) : []);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkScore = () => {
    const score = prompt("Nhập điểm cho các nhân viên đã chọn (0-100):");
    if (score !== null) {
      const numScore = Number(score);
      if (numScore >= 0 && numScore <= 100) {
        setParticipants((prev) =>
          prev.map((p) => (selectedIds.includes(p.id) ? { ...p, score: numScore } : p))
        );
      }
    }
  };

  const handleBulkRating = () => {
    const rating = prompt("Chọn đánh giá:\n1. Xuất sắc\n2. Tốt\n3. Trung bình\n4. Cần cải thiện");
    const ratings = ["Xuất sắc", "Tốt", "Trung bình", "Cần cải thiện"];
    if (rating && Number(rating) >= 1 && Number(rating) <= 4) {
      setParticipants((prev) =>
        prev.map((p) =>
          selectedIds.includes(p.id) ? { ...p, rating: ratings[Number(rating) - 1] } : p
        )
      );
    }
  };

  const handleBulkUpload = () => {
    alert("Chức năng upload hàng loạt đang được phát triển");
  };

  const handleSaveDraft = () => {
    // TODO: Save to backend
    alert("Đã lưu nháp thành công!");
  };

  const handlePublish = () => {
    const confirmed = window.confirm(
      "Sau khi công bố, bạn không thể chỉnh sửa kết quả. Bạn có chắc chắn muốn công bố?"
    );
    if (confirmed) {
      // TODO: Publish to backend
      alert("Đã công bố kết quả! Nhân viên sẽ nhận được thông báo.");
    }
  };

  const handleUploadCommonEvidence = () => {
    alert("Upload minh chứng chung cho toàn bộ hoạt động");
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      if (!data) return;

      try {
      // Construct module name dynamically to avoid Vite static import analysis
      const modName = 'x' + 'lsx';
      const XLSX = await import(/* @vite-ignore */ modName);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

        if (!rows || rows.length === 0) {
          alert("Không tìm thấy dữ liệu trong file.");
          return;
        }

        const norm = (s: any) => (s || "").toString().trim().toLowerCase();

        const getField = (row: any, keys: string[]) => {
          for (const k of keys) {
            for (const prop of Object.keys(row)) {
              if (prop.toString().trim().toLowerCase() === k) return row[prop];
            }
          }
          return null;
        };

        const codeKeys = ["code", "mã", "ma", "id"];
        const scoreKeys = ["score", "điểm", "diem", "points"];
        const ratingKeys = ["rating", "đánh giá", "danhgia", "rate"];
        const rankKeys = ["rank", "thứ hạng", "thu hang", "position"];

        let updated = 0;

        setParticipants((prev) =>
          prev.map((p) => {
            // find matching row by code (case-insensitive)
            const row = rows.find((r) => {
              const val = getField(r, codeKeys);
              return val && norm(val) === p.code.toLowerCase();
            });

            if (!row) return p;

            const newScoreRaw = getField(row, scoreKeys);
            const newRatingRaw = getField(row, ratingKeys);
            const newRankRaw = getField(row, rankKeys);

            const newScore = newScoreRaw !== null ? Number(newScoreRaw) : p.score;
            const newRating = newRatingRaw !== null ? String(newRatingRaw) : p.rating;
            const newRank = newRankRaw !== null ? Number(newRankRaw) : p.rank;

            updated++;

            return {
              ...p,
              score: typeof newScore === "number" && !Number.isNaN(newScore) ? newScore : p.score,
              rating: newRating ?? p.rating,
              rank: typeof newRank === "number" && !Number.isNaN(newRank) ? newRank : p.rank,
              completed: (typeof newScore === "number" && !Number.isNaN(newScore) ? newScore : p.score) !== null,
            };
          })
        );

        alert(`Đã cập nhật ${updated} bản ghi từ file.`);
      } catch (err) {
        // dynamic import failed: suggest installing xlsx
        // eslint-disable-next-line no-console
        console.error(err);
        alert(
          'Không thể xử lý file. Vui lòng cài package "xlsx": chạy `npm install xlsx` rồi thử lại.'
        );
      } finally {
        // reset input so same file can be chosen again
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Filter participants
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    switch (activeFilter) {
      case "Chưa nhập":
        matchesFilter = p.score === null;
        break;
      case "Đã nhập":
        matchesFilter = p.score !== null;
        break;
      case "Không hoàn thành":
        matchesFilter = !p.completed;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  const completedCount = participants.filter((p) => p.score !== null).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1" style={{ backgroundColor: 'var(--color-bg-secondary)', padding: 'var(--spacing-6)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            {/* Header */}
            <div className="card" style={{ 
              background: 'linear-gradient(to right, var(--color-primary), var(--color-primary-dark))',
              padding: 'var(--spacing-8)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center" style={{ gap: 'var(--spacing-4)' }}>
                  <div style={{ 
                    padding: 'var(--spacing-3)', 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    borderRadius: 'var(--radius-lg)' 
                  }}>
                    <Award style={{ width: '1.75rem', height: '1.75rem', color: 'white' }} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold" style={{ color: 'white', letterSpacing: '-0.025em' }}>
                      Kết quả hoạt động
                    </h1>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 'var(--spacing-1)' }}>
                      Quản lý và đánh giá kết quả tham gia
                    </p>
                  </div>
                </div>
                <div className="flex items-center" style={{ gap: 'var(--spacing-3)' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportExcel}
                    className="hidden"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="btn text-sm"
                    style={{ 
                      backgroundColor: 'white', 
                      color: 'var(--color-primary)',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}
                    title="Import từ Excel"
                  >
                    <Upload style={{ width: '1rem', height: '1rem' }} />
                    Import từ Excel
                  </button>

                  <button
                    onClick={handleUploadCommonEvidence}
                    className="btn text-sm"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      color: 'var(--color-primary)',
                      padding: 'var(--spacing-3) var(--spacing-4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-2)'
                    }}
                  >
                    <Upload style={{ width: '1rem', height: '1rem' }} />
                    Upload minh chứng chung
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Section */}
            <div className="card" style={{ 
              padding: 'var(--spacing-5)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--spacing-5)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--color-border)'
            }}>
              <div className="flex justify-between items-center" style={{ gap: 'var(--spacing-4)' }}>
                <div style={{ flexShrink: 0 }}>
                  <label className="text-xs font-semibold text-muted" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Hoạt động</label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="input-field text-sm font-medium text-primary"
                    style={{ 
                      width: '20rem',
                      padding: 'var(--spacing-3) var(--spacing-4)'
                    }}
                  >
                    <option value="marathon2024">Chiến dịch Marathon 2024</option>
                    <option value="hackathon">Hackathon Q3</option>
                    <option value="teambuilding">Team Building 2024</option>
                  </select>
                </div>

                <div style={{ flex: 1, maxWidth: '28rem' }}>
                  <label className="text-xs font-semibold text-muted" style={{ 
                    display: 'block', 
                    marginBottom: 'var(--spacing-2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Tìm kiếm</label>
                  <div style={{ position: 'relative' }}>
                    <Search style={{ 
                      position: 'absolute', 
                      left: 'var(--spacing-3)', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      color: 'var(--color-text-muted)', 
                      width: '1.125rem', 
                      height: '1.125rem' 
                    }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tên hoặc mã nhân viên"
                      className="input-field text-sm"
                      style={{ 
                        width: '100%',
                        paddingLeft: 'var(--spacing-10)',
                        paddingRight: 'var(--spacing-4)',
                        paddingTop: 'var(--spacing-3)',
                        paddingBottom: 'var(--spacing-3)'
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ paddingTop: 'var(--spacing-1)' }}>
                <ResultFilterChips onFilterChange={setActiveFilter} />
              </div>
            </div>

            {/* Progress Bar */}
            <ProgressBar done={completedCount} total={participants.length} />

            {/* Bulk Action Bar */}
            <BulkActionBar
              selected={selectedIds.length}
              onClearSelection={handleClearSelection}
              onBulkScore={handleBulkScore}
              onBulkRating={handleBulkRating}
              onBulkUpload={handleBulkUpload}
            />

            {/* Result Table */}
            <ResultTable
              participants={filteredParticipants}
              selectedIds={selectedIds}
              onSelectChange={handleSelectChange}
              onSelectAll={handleSelectAll}
              onScoreChange={handleScoreChange}
              onRatingChange={handleRatingChange}
              onRankChange={handleRankChange}
              onUploadEvidence={handleUploadEvidence}
            />

            {/* Footer Actions */}
            <div className="flex justify-end" style={{ gap: 'var(--spacing-3)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-4)' }}>
              <button
                onClick={handleSaveDraft}
                className="btn btn-secondary text-sm"
                style={{ padding: 'var(--spacing-3) var(--spacing-5)' }}
              >
                Lưu nháp
              </button>
              <button
                onClick={handlePublish}
                className="btn btn-primary text-sm"
                style={{ padding: 'var(--spacing-3) var(--spacing-6)' }}
              >
                Công bố kết quả
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
