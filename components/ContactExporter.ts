import * as FileSystem from "expo-file-system";
import * as XLSX from "xlsx";

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number: string; label?: string }>;
}

interface ExcelRow {
  "Nome Completo": string;
  "Primeiro Numero": string;
  "Segundo Numero": string;
}

export class ContactExporter {
  private formatPhoneNumber(number: string): string {
    // Remove all non-digit characters except + at the beginning
    const cleaned = number.replace(/[^\d+]/g, "");

    // Check if the number starts with Brazil's country code
    if (cleaned.startsWith("+55")) {
      // Format as Brazilian phone number
      const match = cleaned.match(/^\+55(\d{2})(\d{4,5})(\d{4})$/);
      if (match) {
        const [, ddd, firstPart, secondPart] = match;
        return `(${ddd}) ${firstPart}-${secondPart}`;
      } else {
        return cleaned; // Return original if format doesn't match
      }
    }
    return number; // Return original if not a standard format
  }

  private getPhoneByLabel(
    phoneNumbers: Array<{ number: string; label?: string }>,
    targetLabel: string
  ): string {
    const phone = phoneNumbers?.find((p) =>
      p.label?.toLowerCase().includes(targetLabel.toLowerCase())
    );
    return phone ? this.formatPhoneNumber(phone.number) : "";
  }

  private processContactData(contacts: Contact[]): ExcelRow[] {
    return contacts.map((contact) => {
      const phoneNumbers = contact.phoneNumbers || [];

      return {
        "Nome Completo": contact.name || "",
        "Primeiro Numero": phoneNumbers[0]
          ? this.formatPhoneNumber(phoneNumbers[0].number)
          : "",
        "Segundo Numero":
          this.getPhoneByLabel(phoneNumbers, "mobile") ||
          this.getPhoneByLabel(phoneNumbers, "cell"),
      };
    });
  }

  async exportToExcel(contacts: Contact[]): Promise<string> {
    try {
      // Process contact data
      const processedData = this.processContactData(contacts);

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(processedData);

      // Set column widths for better readability
      const columnWidths = [
        { wch: 30 }, // Full Name
        { wch: 18 }, // Primary Phone
        { wch: 18 }, // Mobile Phone
      ];

      worksheet["!cols"] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contacts");

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
        cellStyles: true,
        cellDates: true,
      });

      // Create filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, -5);
      const filename = `contacts_export_${timestamp}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;

      // Convert buffer to base64 string
      const base64String = btoa(
        new Uint8Array(excelBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Write file to device
      await FileSystem.writeAsStringAsync(filePath, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filePath;
    } catch (error) {
      console.error("Excel export error:", error);
      throw new Error("Failed to export contacts to Excel");
    }
  }
}
