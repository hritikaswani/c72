import React from "react";
import { Text, View , StyleSheet, Image} from "react-native";
import { TouchableOpacity, KeyboardAvoidingView, ToastAndroid} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Permissions from "expo-permissions";
import { TextInput } from "react-native-gesture-handler";
import * as firebase from 'firebase'
import db from '../config'

export default class TransactionScreen extends React.Component {
  constructor() {
    super();
    this.state = {
      hasCameraPermissions: null,
      scanned: false,
      scannedData: "",
      buttonState:"normal",
      scannedBookID:"",
      scannedStudentID:""
    };
  }

handleBarcodeScan = async ({type,data}) => {
  const {buttonState}=this.state
  if (buttonState==="Book ID"){
    this.setState ({
    scanned:true,
    scannedBookID: data,
    buttonState:'normal'
  })
    }
else if (buttonState==="Student ID"){
  this.setState ({
    scanned:true,
    scannedStudentID: data,
    buttonState:'normal'
})
}
}
  getCameraPermissions = async (id) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermissions: status === "granted",
      buttonState:id,
      scanned:false
    });
  };

  handleTransaction=async() =>{

    db.collection("BOOKS").doc(this.state.scannedBookID).get()
    .then((doc)=> {
    console.log(doc.data()) 
    var book=doc.data()
    if(book.bookavailibility){
      this.initiateBookIssue()
      TransactionMessage="BOOK ISSUED"
      ToastAndroid.show(TransactionMessage,ToastAndroid.SHORT)
    }
    else{
      this.initiateBookReturn()
      TransactionMessage="BOOK RETURNED"
      ToastAndroid.show(TransactionMessage,ToastAndroid.SHORT)
    }
    }
    )

  }
    initiateBookIssue=async() => {
      db.collection("Transactions").add({
        "StudentID":this.state.scannedStudentID,
        "BookID":this.state.scannedBookID,
        "date":firebase.firestore.Timestamp.now().todate(),
        "getTransaction":"issue"
      })

      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        "bookavailibility":false
      })
      db.collection("Students").doc(this.state.scannedStudentID).update({
        "no_of_books_issued":firebase.firestore.FieldValue.increment(1)
      })
      Alert.alert("BOOK ISSUED")
      this.setState(
        {
          scannedBookID:"",
          scannedStudentID:""
        }
      )
    }


    initiateBookReturn=async() => {
      db.collection("Transactions").add({
        "StudentID":this.state.scannedStudentID,
        "BookID":this.state.scannedBookID,
        "date":firebase.firestore.Timestamp.now().todate(),
        "getTransaction":"return"
      })

      db.collection("BOOKS").doc(this.state.scannedBookID).update({
        "bookavailibility":true
      })
      db.collection("Students").doc(this.state.scannedStudentID).update({
        "no_of_books_issued":firebase.firestore.FieldValue.increment(-1)
      })
      Alert.alert("BOOK RETURNED")
      this.setState(
        {
          scannedBookID:"",
          scannedStudentID:""
        }
      )
    }


    render() {
    const hasCameraPermissions = this.state.hasCameraPermissions
    const scanned = this.state.scanned
    const buttonState = this.state.buttonState

    if(buttonState!=="normal" && hasCameraPermissions){

      return(

        <BarCodeScanner
        onBarCodeScanned={scanned? undefined:this.handleBarcodeScan}
        />

      )

    }
    else if(buttonState==="normal"){
      return (
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
          <View>
            <Image 
              source={require("../assets/booklogo.jpg")}
              style={{width:200, height:200 }}
            />
            <Text style={{textAlign:'center', fontSize:30}}>
              WILY APP
            </Text>
          </View>
          <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book ID"
              onChangeText={(text) => {
                this.setState({scannedBookID:text})
              }} 
              value={this.state.scannedBookID}
            /> 
            <TouchableOpacity style={styles.scanButton} 
            onPress={()=>{this.getCameraPermissions("Book ID")}}
            >
            <Text style={styles.buttonText}>
              scan
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student ID"
              onChangeText={(text) => {
                this.setState({scannedStudentID:text})
              }}
              value={this.state.scannedStudentID}
            /> 
            <TouchableOpacity style={styles.scanButton}
            onPress={()=>{this.getCameraPermissions("Student ID")}}
            >
            <Text style={styles.buttonText}>
              scan
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={async() => {this.handleTransaction()
          this.setState({scannedBookID:"", scannedStudentID:""})
          }}>
            <Text>SUBMIT</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      );
    }

  }
}

const styles = StyleSheet.create({
  scanButton: { backgroundColor: "#2196F3", padding: 10, margin: 10 },
  buttonText: { fontSize: 20 },
});
