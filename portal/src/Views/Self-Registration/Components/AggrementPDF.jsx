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

const aggreementText = `hello
    So, if I'm understanding right what you're saying and especially this example, 
    what you propose is to use something that already exists and that we're already monitoring to decide whether an effect hook should execute or not 
  `;

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
					<Text style={styles.title}> VRE Terms of Use </Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}> Section One : </Text>
					<Text style={styles.inputField}>
						{aggreementText}
					</Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>Section Two : </Text>
					<Text style={styles.inputField}>
						{aggreementText}
					</Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>Section Three : </Text>
					<Text style={styles.inputField}>
						{aggreementText}
					</Text>
				</View>

                <View style={styles.formGroup}>
					<Text style={styles.fieldName}>Section Four : </Text>
					<Text style={styles.inputField}>
						{aggreementText}
					</Text>
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