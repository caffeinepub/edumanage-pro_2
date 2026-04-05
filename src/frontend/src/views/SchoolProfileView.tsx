import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface SchoolProfile {
  schoolNameEng: string;
  schoolNameHin: string;
  principalName: string;
  schoolCode: string;
  udiseCode: string;
  block: string;
  district: string;
  state: string;
  address: string;
  mobile: string;
  email: string;
  board: string;
}

const defaultProfile: SchoolProfile = {
  schoolNameEng: "",
  schoolNameHin: "",
  principalName: "",
  schoolCode: "",
  udiseCode: "",
  block: "",
  district: "",
  state: "मध्यप्रदेश",
  address: "",
  mobile: "",
  email: "",
  board: "MP Board",
};

const LS_KEY = "schoolProfile";

export function SchoolProfileView() {
  const [profile, setProfile] = useState<SchoolProfile>(defaultProfile);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<SchoolProfile>;
        setProfile({ ...defaultProfile, ...saved });
      }
    } catch {
      /* ignore */
    }
  }, []);

  function set(field: keyof SchoolProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function saveProfile() {
    localStorage.setItem(LS_KEY, JSON.stringify(profile));
    toast.success("विद्यालय प्रोफाइल सफलतापूर्वक सहेजी गई!");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">School Profile</h1>
          <p className="text-sm text-muted-foreground">
            विद्यालय की जानकारी भरें और सहेजें
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-card border border-border rounded-lg shadow-sm">
        {/* Section: School Name */}
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            विद्यालय का नाम
          </h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="schoolNameEng" className="text-sm font-medium">
              School Name (English) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="schoolNameEng"
              data-ocid="school_profile.schoolNameEng.input"
              value={profile.schoolNameEng}
              onChange={(e) => set("schoolNameEng", e.target.value)}
              placeholder="Government Higher Secondary School"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schoolNameHin" className="text-sm font-medium">
              विद्यालय का नाम (हिंदी)
            </Label>
            <Input
              id="schoolNameHin"
              data-ocid="school_profile.schoolNameHin.input"
              value={profile.schoolNameHin}
              onChange={(e) => set("schoolNameHin", e.target.value)}
              placeholder="शासकीय उच्चतर माध्यमिक विद्यालय"
              className="bg-background"
            />
          </div>
        </div>

        {/* Section: Principal & Codes */}
        <div className="px-6 py-4 border-b border-t border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            प्रधानाचार्य एवं कोड
          </h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="principalName" className="text-sm font-medium">
              प्रधानाचार्य का नाम
            </Label>
            <Input
              id="principalName"
              data-ocid="school_profile.principalName.input"
              value={profile.principalName}
              onChange={(e) => set("principalName", e.target.value)}
              placeholder="प्रधानाचार्य का पूरा नाम"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="board" className="text-sm font-medium">
              संबद्धता बोर्ड
            </Label>
            <Input
              id="board"
              data-ocid="school_profile.board.input"
              value={profile.board}
              onChange={(e) => set("board", e.target.value)}
              placeholder="MP Board"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="schoolCode" className="text-sm font-medium">
              विद्यालय कोड
            </Label>
            <Input
              id="schoolCode"
              data-ocid="school_profile.schoolCode.input"
              value={profile.schoolCode}
              onChange={(e) => set("schoolCode", e.target.value)}
              placeholder="जैसे: 12345"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="udiseCode" className="text-sm font-medium">
              UDISE कोड
            </Label>
            <Input
              id="udiseCode"
              data-ocid="school_profile.udiseCode.input"
              value={profile.udiseCode}
              onChange={(e) => set("udiseCode", e.target.value)}
              placeholder="UDISE कोड"
              className="bg-background"
            />
          </div>
        </div>

        {/* Section: Location */}
        <div className="px-6 py-4 border-b border-t border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            स्थान / Location
          </h2>
        </div>
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="block" className="text-sm font-medium">
              विकासखंड / ब्लॉक
            </Label>
            <Input
              id="block"
              data-ocid="school_profile.block.input"
              value={profile.block}
              onChange={(e) => set("block", e.target.value)}
              placeholder="विकासखंड का नाम"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="district" className="text-sm font-medium">
              जिला
            </Label>
            <Input
              id="district"
              data-ocid="school_profile.district.input"
              value={profile.district}
              onChange={(e) => set("district", e.target.value)}
              placeholder="जिले का नाम"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="state" className="text-sm font-medium">
              राज्य
            </Label>
            <Input
              id="state"
              data-ocid="school_profile.state.input"
              value={profile.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="मध्यप्रदेश"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mobile" className="text-sm font-medium">
              मोबाइल नं.
            </Label>
            <Input
              id="mobile"
              data-ocid="school_profile.mobile.input"
              value={profile.mobile}
              onChange={(e) => set("mobile", e.target.value)}
              placeholder="मोबाइल नंबर"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              ईमेल
            </Label>
            <Input
              id="email"
              type="email"
              data-ocid="school_profile.email.input"
              value={profile.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="school@example.com"
              className="bg-background"
            />
          </div>
        </div>

        {/* Section: Address */}
        <div className="px-6 py-4 border-b border-t border-border bg-muted/30">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            पूर्ण पता
          </h2>
        </div>
        <div className="px-6 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-sm font-medium">
              पता (Address)
            </Label>
            <Textarea
              id="address"
              data-ocid="school_profile.address.textarea"
              value={profile.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="विद्यालय का पूरा पता"
              rows={3}
              className="bg-background resize-none"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-5 border-t border-border bg-muted/10 flex justify-end">
          <Button
            onClick={saveProfile}
            data-ocid="school_profile.save_button"
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            सहेजें (Save)
          </Button>
        </div>
      </div>

      {/* Info note */}
      <p className="text-xs text-muted-foreground text-center pb-2">
        यह जानकारी Report Card और Admission Form में automatically भरी जाएगी।
      </p>
    </div>
  );
}
