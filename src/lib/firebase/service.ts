import {addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where} from "firebase/firestore";
import app from "./init";
import bcrypt from "bcrypt";
import { StyledString } from "next/dist/build/swc/types";

const firestore = getFirestore(app);

export async function retrieveData(collectionName:string){
    const snapshot = await getDocs(collection(firestore, collectionName));

    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    return data;
}

export async function retrieveDatabyId(collectionName:string, id: string){
    const snapshot = await getDoc(doc(firestore, collectionName, id));

    const data = snapshot.data();

    return data;
}


export async function signUp(userData : {email : string, fullname : string, password : string, role : string},callback: Function){
    const q = query(collection(firestore, "users"), where("email", "==", userData.email));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    if(data.length > 0){
        callback({
            status : false, message : "Email already exists"
        })
    }else{
        userData.password = await bcrypt.hash(userData.password,10);
        userData.role = "member";
        await addDoc(collection(firestore, "users"), userData).then(() => {
            callback({
                status : true, message : "Register success"
            })
        }).catch((error : any) => {
            callback({
                status : false, message : error.message
            })
        })
    }
}

export async function signIn(userData : {email : string}){
    const q = query(collection(firestore, "users"), where("email", "==", userData.email));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    if (data){
        return data[0];
    }else{
        return null;
    }
}

export async function signInWithGoggle(userData : any, callback : any){
    const q = query(collection(firestore, "users"), where("email", "==", userData.email));
    const snapshot = await getDocs(q);
    const data : any = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
    if(data.length > 0){
        userData.role = data[0].role;
        await updateDoc(doc(firestore, "users", data[0].id), userData).then(() => {
            callback({
                status : true, message : "Sign in with Google success", data : userData
            })
        }).catch(() => {
            callback({
                status : false, message : "Sign in with Google failed"
            })
        })
    }else {
        userData.role = "member";
        await addDoc(collection(firestore, "users"), userData).then(() => {
            callback({
                status : true, message : "Sign in with Google success", data : userData
            })
        }).catch(() => {
            callback({
                status : false, message : "Sign in with Google failed"
            })
        })
    }
}