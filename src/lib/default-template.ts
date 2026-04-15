export const DEFAULT_TEMPLATE_NAME = "Business Permit";

export const DEFAULT_TEMPLATE_CODE = `const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontFamily: "Times New Roman",
    fontSize: 12,
  },
  header: {
    textAlign: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    width: 180,
  },
  value: {
    flex: 1,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 10,
    color: "#888",
  },
  signatureBlock: {
    marginTop: 50,
    alignItems: "flex-end",
    marginRight: 40,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    width: 200,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 10,
    textAlign: "center",
    width: 200,
  },
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>BUSINESS PERMIT</Text>
        <Text style={styles.subtitle}>{$("Municipality")}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Permit Number:</Text>
        <Text style={styles.value}>{$("Permit Number")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Business Name:</Text>
        <Text style={styles.value}>{$("Business Name")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Owner:</Text>
        <Text style={styles.value}>{$("Owner Name")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Business Address:</Text>
        <Text style={styles.value}>{$("Business Address")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Business Type:</Text>
        <Text style={styles.value}>{$("Business Type")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date Issued:</Text>
        <Text style={styles.value}>{$("Date Issued")}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Valid Until:</Text>
        <Text style={styles.value}>{$("Valid Until")}</Text>
      </View>

      <View style={styles.signatureBlock}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>{$("Authorized Signatory")}</Text>
      </View>

      <View style={styles.footer}>
        <Text>This permit is valid only for the period and location specified above.</Text>
      </View>
    </Page>
  </Document>
);`;

export const DEFAULT_VARIABLES: Record<string, string> = {
  Municipality: "City of Antananarivo",
  "Permit Number": "BP-2026-00142",
  "Business Name": "Rakoto Electronics SARL",
  "Owner Name": "Jean Rakoto",
  "Business Address": "12 Avenue de l'Indépendance, Antananarivo 101",
  "Business Type": "Retail Electronics",
  "Date Issued": "2026-04-15",
  "Valid Until": "2027-04-14",
  "Authorized Signatory": "Mayor's Office",
};
