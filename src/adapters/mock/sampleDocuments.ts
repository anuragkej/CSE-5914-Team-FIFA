export interface SampleDocument {
  id: string;
  title: string;
  text: string;
}

export const sampleDocuments: SampleDocument[] = [
  {
    id: "standard-lease",
    title: "Typical campus-area lease (2BR, Summit St)",
    text: `RESIDENTIAL LEASE AGREEMENT

Landlord: Buckeye Campus Properties LLC, an Ohio limited liability company
Tenant(s): Maya Chen
Premises: 2115 Summit St, Apt 2, Columbus, OH 43201, a 2 bedroom, 1 bath apartment.

1. TERM. This lease is for a 12-month term beginning August 15, 2026 and ending August 7, 2027.

2. RENT. Tenant shall pay monthly rent of $1,450.00, due on the first day of each month. Rent may be paid by check, ACH, or through the resident portal.

3. SECURITY DEPOSIT. Tenant shall pay a security deposit of $1,450.00 prior to move-in, refundable per Ohio law within 30 days of move-out less itemized deductions.

4. FEES. Tenant shall pay a one-time administrative fee of $150. A utility fee of $45 per month covers water, sewer and trash. An optional parking fee of $50 per month applies for one reserved space.

5. LATE PAYMENT. Rent received after the 5th of the month incurs a late fee of $50.

6. UTILITIES. Tenant is responsible for electric and internet service.

7. ENTRY. Landlord shall give 24 hours notice before entering except in emergencies.

8. RENEWAL. Landlord will offer renewal terms 90 days before lease end. This lease does not renew automatically.`,
  },
  {
    id: "suspicious-sublease",
    title: "Sublease listing with red flags (2BR, E 12th Ave)",
    text: `SUBLEASE AVAILABLE - MOVE IN NOW

Beautiful 2 bedroom apartment at 83 E 12th Ave, Columbus, OH 43201. Fully furnished, 2 minutes from campus.

Landlord: Marcus Bell (owner). I am out of the country for work so showings are by video only.

Rent is only $650 per month for a 12 month lease. Security deposit of $2,000 required. There is also a non-refundable cleaning deposit of $300 and a one-time application fee of $95. Amenity fee of $35 per month.

To hold the unit, please send the deposit via Zelle or Cash App today and I will mail the keys.

TERMS: Tenant agrees to pay all of Landlord's attorney's fees in any dispute. Tenant agrees to hold Landlord harmless from any and all claims arising from the condition of the premises. Late fee of $150 applies after the 3rd. This lease will automatically renew for successive 12 month periods unless Tenant gives 90 days written notice.`,
  },
  {
    id: "pasted-listing",
    title: "Pasted listing, no lease yet (1BR, W Lane Ave)",
    text: `1 BR / 1 BA apartment for rent, 99 W Lane Ave, Columbus, OH 43201.
Rent: $1,395/month. Managed by Lane Avenue Residential, LLC.
Water, sewer and trash fee of $60 per month. Technology package fee $85 per month (required, includes internet).
Application fee $75. Pet fee $300 one-time plus $35 per month pet rent.
12 month lease. Available August 2026.`,
  },
];
