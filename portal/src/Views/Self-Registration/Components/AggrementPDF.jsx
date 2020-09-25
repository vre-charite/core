import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	Font,
	Image,
} from "@react-pdf/renderer";
import regular from "../fonts/OpenSans-Regular.ttf";
import bold from "../fonts/OpenSans-Bold.ttf";
import logo from "../../../Images/vre-logo.png";
import checkboxChecked from "./checkbox-checked.jpg";

Font.register({
	family: "OpenSans",
	fonts: [
		{
			src: regular,
		},
		{
			src: bold,
			fontWeight: 700,
		},
	],
});

function printCheckboxes(doc) {
	return (
		<Text style={styles.checkboxWrapper}>
			<Image
				style={styles.image}
				src={checkboxChecked}
			/>{" "}
			<Text style={styles.checkboxText}>{doc}</Text>
		</Text>
	);
}

const AggrementPDF = () => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
					<Text style={styles.headerText}>
                        {new Date().toString()}
					</Text>
					<Image style={styles.headerImage} src={logo} />
				</View>

                <View style={styles.section}>
					<Text style={styles.title}> VRE Website Privacy Policy (Draft) </Text>
					<Text style={{...styles.text, textAlign: 'center'}}>Version 1.0 </Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>1 Use of Cookies by the VRE</Text>
					<Text style={styles.text}>
						Cookies are small text files placed on your computer. Some cookies are functional session cookies which
						are used to provide the user with the experience of a session: e.g. they track login details, remember user
						choices and preferences, and in some instances determine site permissions. Other cookies are used to
						provide statistics: e.g. they provide, in anonymous form, the number of visitors accessing a website,
						features users access during website visits, and the general location of the user based on IP address. 
					</Text>
					<Text style={styles.text}>
						This VRE website uses only strictly necessary cookies — these cookies are essential for the proper
						operation of the website, allowing you to browse the website and use its features such as accessing
						secure areas of the site. This website protects your privacy by not creating cookies which contain
						personal data. The following list describes the types of cookies used on the VRE website.
					</Text>
					<View style={styles.formGroup}>
						<Text style={styles.subtext}>• Access token: An encoded token that is used to mark user's identity and access to services.</Text>
						<Text style={styles.subtext}>• Refresh token:  An encoded token that is used to refresh user's session.</Text>
						<Text style={styles.subtext}>• Username: Username of the current user.</Text>
						<Text style={styles.subtext}>• Login status: Indicates whether or not a user is logged into the VRE .</Text>
						<Text style={styles.subtext}>• Terms of Use Notification: Indicates whether or not a user has acknowledged the applicable Terms of Use and Privacy Policy notifications.</Text>
					</View>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>2 VRE Privacy Policy </Text>
					<Text style={styles.text}>
						The VRE is a research infrastructure developed by the Charité and its service partners. 
					</Text>
					<Text style={styles.text}>
						For more information on Data Protection across the project, visit: 
					</Text>
					<Text style={styles.text}>
						https://www.charite.de/en/service/data_protection/ 
					</Text>
					<Text style={styles.text}>
						At present, the Data Protection needs for the VRE are served by the Charité Data Protection Officer. 
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>3 Data Controllers for the VRE website  </Text>
					<Text style={styles.text}>
						The Charité is the coordinating centre for the VRE Research Infrastructure and is the data controller for the personal information processed on the VRE Public Website (https://www.xxxxxx.de), unless otherwise stated. Charité’s legal address is: Charité – Universitätsmedizin Berlin, Charitéplatz 1, 10117 Berlin, Deutschland. 
					</Text>
					<Text style={styles.text}>
						Charité is neither data controller nor in charge of third party embedded content.  
					</Text>
					<Text style={styles.text}>
						All concerns regarding this VRE website, including ethical or data protection issues in the VRE, can be submitted to the Data Protection Officer of the Charite here:
					</Text>
					<Text style={styles.text}>
						https://www.charite.de/en/service/data_protection/
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>4 VRE Data Protection Officer (DPO)</Text>
					<Text style={styles.text}>
						To contact the VRE Data Protection Officer directly, please send an email to the following address:datenschutz@charite.de
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>5 Legal Basis </Text>
					<Text style={styles.text}>
						The legal basis for data processing in this VRE website include: 
					</Text>
					<View style={styles.formGroup}>
						<Text style={styles.subtext}>• Consent given by the Data Subject (GDPR Art. 6(1)(a)) .</Text>
						<Text style={styles.subtext}>• Necessity for the performance of a contract to which the Data Subject is a party, or for taking steps at the request of the Data Subject prior to entering a contract (GDPR Art. 6(1)(b)).</Text>
						<Text style={styles.subtext}>• Compliance with a legal obligation (GDPR Art. 6(1)(c)). For example, where the VRE partners are required to store the data to meet bookkeeping or audit obligations.</Text>
						<Text style={styles.subtext}>• Necessity for the performance of a task carried out in the public interest or in the exercise of official authority vested in the controller (GDPR Art. 6(1)(e)). .</Text>
						<Text style={styles.subtext}>• If the VRE partners have a legitimate interest that is not overridden by the interests or fundamental rights freedoms of the Data Subject (GDPR Art. 6(1)(f)).</Text>
					</View>
					<Text style={styles.text}>
					If you are employed by a VRE partner, your data will not be processed based on consent but rather to comply with a legal obligation, to perform a contract, or in some cases, for purposes of a legitimate interest.
					</Text>
					<Text style={styles.text}>
					This VRE website may process personal data that the Data Subject provides explicitly through account profile entry, login or other forms (e.g. contact forms, event registration, newsletter subscription). This includes required and optional fields entered by the Data Subject. 
					</Text>
					<Text style={styles.text}>
					Additionally, this VRE website logs the IP address used to access the website for security reasons. 
					</Text>
					<Text style={styles.text}>
					Personal data may be processed to provide access to services offered by the VRE website, to facilitate collaboration among users of the VRE website and to contact users to keep them informed of events and news regarding VRE. 
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>6 Non-VRE Services </Text>
					<Text style={styles.text}>
					This VRE website may receive support and services from providers outside of the Charité. If any personal data is transferred to these providers, the administrator of this website is required to consult the Charité Data Protection Officer to ensure that all data privacy obligations are met. 
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>7 Data Shared within the VRE Consortium </Text>
					<Text style={styles.text}>
					The data controller may share data with VRE service providers within the VRE Consortium. All VRE partners are required by contract to meet all GDPR requirements. In some cases, VRE partners may publish statistical information about VRE usage, e.g. to the European Commission (EC). Such statistical information will always be anonymous. 
					</Text>
					<Text style={styles.text}>
					The data controller may also share data with official authorities if required by an administrative or court order, or with auditors. </Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>8 Data Shared between Research Partners and VRE </Text>
					<Text style={styles.text}>
						The VRE receives data from its Research Partners as part of its operational function. This includes data from research institutions and data providers. The VRE will process this data in accordance with applicable EU laws such as the GDPR on privacy and data protection. 					
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>9 Data Shared with Third Parties </Text>
					<Text style={styles.text}>
						No personal data collected from this VRE website is sold or otherwise shared for the purposes of direct marketing or other commercial purposes.</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>10 Transfers of the personal data to third countries </Text>
					<Text style={styles.text}>
						Personal data may be transferred between the VRE service providers based in different countries. Personal data transfers may take place within the EU/EEA and to other countries that have been found to have adequate levels of protection by the European Commission including, but not limited to, Switzerland and Israel. All other personal data transfers are made with adequate safeguards in place including EC Standard Contractual Clauses, Binding Corporate Rules, or as part of the Privacy Shield Framework. 
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>11 Retention periods for the personal data </Text>
					<Text style={styles.text}>
						Cookies may be erased by the user at the end of each session. Some web browsers offer to do this automatically. 					
					</Text>
					<Text style={styles.text}>
						Personal data entered by the Data Subject may be retained up to 2 years after the lifetime of the VRE research infrastructure. 
					</Text>
					<Text style={styles.text}>
						Data Subjects may request erasure of their personal data to the VRE DPO. The data controller will execute such requests, except for minimal personal data which may be retained if needed for monitoring legal compliance. Backups may also be retained in case of legitimate interests of the data controller for the continued exploitation of the research infrastructure. 
					</Text>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>12 Rights available to individuals </Text>
					<View style={styles.formGroup}>
						<Text style={styles.subtext}>• The rights available to individuals, as provided in the General Data Protection regulation in respect of the processing their personal data, include: </Text>
						<Text style={styles.subtext}>• the right to be informed (GDPR Articles 12-14, and Recitals 58 and 60-62), </Text>
						<Text style={styles.subtext}>• the right to access personal data (GDPR Articles 12, 15 and Recitals 63, 64), </Text>
						<Text style={styles.subtext}>• the right to rectification including having inaccurate personal data completed if it is incomplete (GDPR Articles 5, 12, 16 and 19), .</Text>
						<Text style={styles.subtext}>• the right to erasure (GDPR Articles 18, 19 and Recital 67), </Text>
						<Text style={styles.subtext}>• the right to restrict processing (GDPR Article 18),  </Text>
						<Text style={styles.subtext}>• the right to data portability (GDPR Article 20 and Recital 68), </Text>
						<Text style={styles.subtext}>• the right to object (GDPR Article 21). </Text>
					</View>
				</View>

				<View style={styles.formGroup}>
					<Text style={styles.fieldName}>13 Right to lodge a complaint with a supervisory authority  </Text>
					<Text style={styles.text}>
					The VRE DPO and its service providers will make every reasonable effort to address your data protection concerns. However, you have a right to lodge a complaint with a data protection authority. Contact information for the European Data Protection Board and EU DPAs is available here: 					</Text>
					<Text style={styles.text}>
						<Text style={styles.subtext}>http://ec.europa.eu/newsroom/article29/item-detail.cfm?item_id=612080</Text>
						<Text style={styles.subtext}>https://edpb.europa.eu/about-edpb/board/members_en </Text>
					</Text>
					<Text style={styles.text}>
						<Text style={styles.subtext}>Contact information for the Swiss Data Protection authority is available here:</Text>
						<Text style={styles.subtext}>https://www.edoeb.admin.ch/edoeb/en/home.html  </Text>
					</Text>
					<Text style={styles.text}>
						<Text style={styles.subtext}>Contact information for the Israeli Data Protection authority is available here:</Text>
						<Text style={styles.subtext}>https://www.gov.il/en/Departments/the_privacy_protection_authority </Text>
					</Text>
					<Text style={styles.text}>
						<Text style={styles.subtext}>Contact information for the Norwegian Data Protection authority is available here:</Text>
						<Text style={styles.subtext}>https://www.datatilsynet.no/en/about-us/  </Text>
					</Text>
					<Text style={styles.text}>
					Contact information for the Turkish Data Protection authority is available here: https://kvkk.gov.tr/ 					</Text>
				</View>

            </Page>
        </Document>
    )
};

const styles = StyleSheet.create({
	page: {
		paddingTop: 10,
		paddingLeft: 30,
		paddingRight: 30,
		fontFamily: "OpenSans",
	},
	title: {
		fontSize: 24,
		margin: 10,
		textAlign: "center",
		fontWeight: 700,
		color: "#5e94d4",
	},
	tag: {
		textAlign: "center",
		fontSize: 10,
		marginBottom: 3,
	},
	small: {
		padding: 5,
		fontSize: 10,
	},
	header: {
		paddingBottom: 10,
	},
	headerImage: {
		width: "20vw",
		display: "inline-block",
	},
	headerText: {
		display: "inline-block",
		textAlign: "center",
		padding: 5,
		paddingBottom: 10,
		fontSize: 10,
	},
	formGroup: {
		display: "block",
	},
	fieldName: {
		fontSize: 12,
		fontWeight: 700,
		color: "#5e94d4",
	},
	text: {
		fontSize: 12,
		paddingBottom: 15,
	},
	subtext: {
		fontSize: 12,
		paddingBottom: 5,
		marginLeft: 10,
	},
	checkboxText: {
		fontSize: 12,
		paddingBottom: 4, //?
	},
	checkboxWrapper: {
		marginBottom: 5,
	},
	inputField: {
		fontSize: 12,
		padding: 5,
		borderWidth: 1,
		borderColor: "#D9D9D9",
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomRightRadius: 5,
		borderBottomLeftRadius: 5,
		marginBottom: 15,
	},
	image: {
		width: 12,
		height: 12,
	},
});

export default AggrementPDF;