export interface ProvinceData {
  name: string;
  districts: string[];
}

export class SriLankaLocations {
  public static readonly PROVINCES: ProvinceData[] = [
    {
      name: "Western",
      districts: ["Colombo", "Gampaha", "Kalutara"],
    },
    {
      name: "Central",
      districts: ["Kandy", "Matale", "Nuwara Eliya"],
    },
    {
      name: "Southern",
      districts: ["Galle", "Matara", "Hambantota"],
    },
    {
      name: "Northern",
      districts: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
    },
    {
      name: "Eastern",
      districts: ["Trincomalee", "Batticaloa", "Ampara"],
    },
    {
      name: "North Western",
      districts: ["Kurunegala", "Puttalam"],
    },
    {
      name: "North Central",
      districts: ["Anuradhapura", "Polonnaruwa"],
    },
    {
      name: "Uva",
      districts: ["Badulla", "Monaragala"],
    },
    {
      name: "Sabaragamuwa",
      districts: ["Ratnapura", "Kegalle"],
    },
  ];

  public static getProvinces(): string[] {
    return this.PROVINCES.map((p) => p.name);
  }

  public static getDistrictsByProvince(provinceName?: string): string[] {
    if (!provinceName) {
      return this.PROVINCES.flatMap((p) => p.districts);
    }
    const found = this.PROVINCES.find(
      (p) => p.name.toLowerCase() === provinceName.toLowerCase()
    );
    return found ? found.districts : this.PROVINCES.flatMap((p) => p.districts);
  }

  public static getProvinceByDistrict(districtName?: string): string | undefined {
    if (!districtName) return undefined;
    const found = this.PROVINCES.find((p) =>
      p.districts.some((d) => d.toLowerCase() === districtName.toLowerCase())
    );
    return found ? found.name : undefined;
  }
}
