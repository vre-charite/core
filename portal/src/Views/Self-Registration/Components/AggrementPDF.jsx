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
					<Text style={styles.title}> Platform Terms of Use Agreement </Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>Data Protection Statement</Text>
					<Text style={styles.text}>
						Thank you for your interest in our company. Data protection is of the
						utmost importance to Charité – Universitätsmedizin Berlin. It is
						generally possible to use our website without having to provide any
						personal data. However, if a data subject wishes to use our website to
						access specific services offered by our company, the processing of
						personal data may become necessary. If it is necessary to process
						personal data, and there is no legal basis for such processing, we will
						generally obtain the data subject’s consent.
					</Text>
					<Text style={styles.text}>
						The processing of personal data, such as a data subject's name, address,
						email address or telephone number, shall always be performed in
						accordance with the General Data Protection Regulation (“GDPR”) and in
						compliance with the country-specific data protection regulations
						applicable to Charité – Universitätsmedizin Berlin. The aim of our
						organization’s data protection statement is to inform the general public
						of the nature, scope and purpose of the personal data we collect, use
						and process. This data protection statement also informs data subjects
						of the rights to which they are entitled.
					</Text>
					<Text style={styles.text}>
						As the data controller, Charité – Universitätsmedizin Berlin has
						implemented numerous technical and organizational measures to ensure
						that personal data processed via this website enjoy the most
						comprehensive protection possible. However, due to some of the security
						vulnerabilities inherent in data transfer via the internet, complete
						protection cannot be guaranteed. For this reason, data subjects are free
						to choose alternative means (e.g. via telephone) by which to transfer
						their personal data.
					</Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>1.Definitions</Text>
					<Text style={styles.text}>
						Charité – Universitätsmedizin Berlin’s data protection statement uses
						the terms adopted by the European legislator for the purposes of the
						GDPR.
					</Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>2. Name and contact details of the data protection officer</Text>
					<Text style={styles.text}>
						For the purposes of the GDPR, other data protection laws applicable to Member States of the European Union and other provisions relating to the subject of data protection, the controller is:
					</Text>
					<Text style={styles.text}>
						Charité – Universitätsmedizin Berlin Charitéplatz 1
					</Text>
					<Text style={styles.text}>
						10117 Berlin
					</Text>
					<Text style={styles.text}>
						Deutschland
					</Text>
					<Text style={styles.text}>
						+49 30 450 50
					</Text>
					<Text style={styles.text}>
						datenschutz(at)charite.de
					</Text>
					<Text style={styles.text}>
						Website: https://www.charite.de
					</Text>
					<Text style={styles.text}>
						Data Protection Officer
					</Text>
					<Text style={styles.text}>
						For any questions on the processing of your personal data or on your rights under data protection law, please contact:
					</Text>
					<Text style={styles.text}>
						Datenschutz der Charité – Universitätsmedizin Berlin
					</Text>
					<Text style={styles.text}>
						Charitéplatz 1
					</Text>
					<Text style={styles.text}>
						10117 Berlin
					</Text>
					<Text style={styles.text}>
						+49 30 450 580 016
					</Text>
					<Text style={styles.text}>
						datenschutz(at)charite.de
					</Text>
					<Text style={styles.text}>
						You can contact us via the contact details provided in Section 2 of this Data Protection Statement.
					</Text>
				</View>

                <Text style={styles.fieldName}>Cookies Policy</Text>
				<Text style={styles.text}>
					We use following strictly necessary cookies to fulfil the site functionality. These are not tracking cookies.
				</Text>
				<Text style={styles.text}>
					Access token :
				</Text>
				<Text style={styles.text}>
					An encoded token that is used to mark user's identity and access to services.
				</Text>
				<Text style={styles.text}>
					Refresh token:
				</Text>
				<Text style={styles.text}>
					An encoded token that is used to refresh user's session.
				</Text>
				<Text style={styles.text}>
					Username :
				</Text>
				<Text style={styles.text}>
					Username of the current user.
				</Text>
				<Text style={styles.text}>
					Login status :
				</Text>
				<Text style={styles.text}>
					A boolean that marks whether a user is logged in.
				</Text>
				<Text style={styles.text}>
					Explainations about other cookies, if any.
				</Text>
				<Text style={styles.text}>
					The site is currently using following cookies:
				</Text>
				<Text style={styles.text}>
					{printCheckboxes('Strictly necessary cookies')}
				</Text>
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