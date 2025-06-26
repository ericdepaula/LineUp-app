import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';

interface Contact {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumbers?: Array<{ number: string; label?: string }>;
  emails?: Array<{ email: string; label?: string }>;
  addresses?: Array<{ 
    street?: string; 
    city?: string; 
    region?: string; 
    postalCode?: string; 
    country?: string; 
    label?: string 
  }>;
  company?: string;
  jobTitle?: string;
  birthday?: Date;
  note?: string;
}

interface ExcelRow {
  'Full Name': string;
  'Primary Phone': string;
  'Mobile Phone': string;
  'Primary Email': string;
  'Notes': string;
}

export class ContactExporter {
  private formatPhoneNumber(number: string): string {
    // Remove all non-digit characters except + at the beginning
    const cleaned = number.replace(/[^\d+]/g, '');
    
    // Handle US phone numbers
    if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7)}`;
    }
    
    return number; // Return original if not a standard format
  }

  private getPhoneByLabel(phoneNumbers: Array<{ number: string; label?: string }>, targetLabel: string): string {
    const phone = phoneNumbers?.find(p => 
      p.label?.toLowerCase().includes(targetLabel.toLowerCase())
    );
    return phone ? this.formatPhoneNumber(phone.number) : '';
  }

  private getEmailByLabel(emails: Array<{ email: string; label?: string }>, targetLabel: string): string {
    const email = emails?.find(e => 
      e.label?.toLowerCase().includes(targetLabel.toLowerCase())
    );
    return email ? email.email : '';
  }

  private formatAddress(address: any): string {
    if (!address) return '';
    
    const parts = [
      address.street,
      address.city,
      address.region,
      address.postalCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    try {
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '';
    }
  }

  private processContactData(contacts: Contact[]): ExcelRow[] {
    return contacts.map(contact => {
      const phoneNumbers = contact.phoneNumbers || [];
      const emails = contact.emails || [];
      const addresses = contact.addresses || [];
      const primaryAddress = addresses[0];

      return {
        'Full Name': contact.name || '',
        'Primary Phone': phoneNumbers[0] ? this.formatPhoneNumber(phoneNumbers[0].number) : '',
        'Mobile Phone': this.getPhoneByLabel(phoneNumbers, 'mobile') || this.getPhoneByLabel(phoneNumbers, 'cell'),
        'Primary Email': emails[0] ? emails[0].email : '',
        'Notes': contact.note || '',
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
        { wch: 25 }, // Primary Email
        { wch: 30 }, // Notes
      ];
      
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

      // Generate Excel file buffer
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array',
        cellStyles: true,
        cellDates: true
      });

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `contacts_export_${timestamp}.xlsx`;
      const filePath = `${FileSystem.documentDirectory}${filename}`;

      // Convert buffer to base64 string
      const base64String = btoa(
        new Uint8Array(excelBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      // Write file to device
      await FileSystem.writeAsStringAsync(filePath, base64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filePath;
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Failed to export contacts to Excel');
    }
  }
}