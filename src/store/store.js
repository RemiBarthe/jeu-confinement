import Vue from 'vue'
import Vuex from 'vuex'

import { db } from "../firebase"

export const IS_CURRENT_USER = 'IS_CURRENT_USER'
export const SET_USERS = 'SET_USERS'
export const SET_ROUND = 'SET_ROUND'
export const SET_QUESTIONS = 'SET_QUESTIONS'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        currentRoom: null,
        isHost: null,
        round: null,
        users: [],
        questions: [],
    },
    getters: {

    },
    actions: {
        joinRoom({ commit }, payload) {
            const idRoom = payload.idRoom.toString()
            const idUser = payload.id.toString()

            db.collection("rooms").doc(idRoom).collection("users").doc(idUser).set({ name: payload.name, avatar: payload.avatar })
            db.collection("rooms").doc(idRoom).set({ round: 0 })

            db.collection("rooms").doc(idRoom).collection("users").onSnapshot(querySnapshot => {
                let usersArray = []

                querySnapshot.forEach(doc => {
                    let user = doc.data()
                    user.id = doc.id
                    usersArray.push(user)
                })

                commit(SET_USERS, usersArray)
            })

            db.collection("rooms").doc(idRoom).onSnapshot(querySnapshot => {
                commit(SET_ROUND, querySnapshot.data().round)
            })

            commit(IS_CURRENT_USER, { id: payload.id, idRoom: payload.idRoom, isHost: payload.isHost })

        },
        setQuestions({ commit }, payload) {
            const idRoom = payload.toString();
            //Cherche dans la BDD:Table (countQuestions) => Valeur de sortie count:
            db.collection("countQuestions").doc("0").get().then(doc =>{
                let dataSize = doc.data()
                //récuperer la data : Variable.NomAttribut
                let lenQuestion = dataSize.count
                

                //let questionsArray = []
                //querySnapshot.forEach(function (doc) {
                    //db.collection("rooms").doc(idRoom).collection("questions").doc(doc.id).set(doc.data())
                    //let question = doc.data()
                    //question.id = doc.id
                    
                    //questionsArray.push(question)
               // })
                //commit(SET_QUESTIONS, questionsArray)
                let questionsArray =[]

                for (let i = 0; i < 5; i ++ ){ //position
                const randomize = Math.floor(Math.random() * lenQuestion); // Valeur:10 à enlever | il faut récup taille de l'appel
                console.log(randomize)
                db.collection("questions").doc(""+randomize).get().then(doc=> { 

                    db.collection("rooms").doc(idRoom).collection("questions").doc(doc.id).set(doc.data())
                    let question = doc.data()
                    //question.id = doc.id
                    questionsArray.push(question)
                    })  
            }
            commit(SET_QUESTIONS, questionsArray)
            })
        },
        testRandomize(){

            let rngTab=[];
            for (let i = 0; i < 5; i ++ ){
                const randomize = Math.floor(Math.random() * 10);
                rngTab.push(randomize)
            }
            // faire un tableau i:position, j:valeur qui compare pour chaque position la valeur et si valeur = alors math.random
            console.log(rngTab)

        },
        getQuestions({ commit }, payload) {
            const idRoom = payload.toString()
            db.collection("rooms").doc(idRoom).collection("questions").get().then(function (querySnapshot) {
                let questionsArray = []
                querySnapshot.forEach(function (doc) {
                    let question = doc.data()
                    question.id = doc.id
                    questionsArray.push(question)
                })

                commit(SET_QUESTIONS, questionsArray)
            })
        },
        disconnectUser({ commit }, payload) {
            const idUser = payload.id.toString()
            const idRoom = payload.idRoom.toString()

            db.collection("rooms").doc(idRoom).collection("users").doc(idUser).delete()
            commit(IS_CURRENT_USER, null)
        },
        setRound({ commit }, payload) {
            const idRoom = payload.idRoom.toString()

            db.collection("rooms").doc(idRoom).set({ round: payload.round })
            commit(SET_ROUND, payload)
        },

    },

    mutations: {
        [IS_CURRENT_USER](state, payload) {
            state.currentUser = payload.id
            state.currentRoom = payload.idRoom
            state.isHost = payload.isHost
        },
        [SET_USERS](state, payload) {
            state.users = payload
        },
        [SET_QUESTIONS](state, payload) {
            state.questions = payload
        },
        [SET_ROUND](state, payload) {
            state.round = payload
        }
    }
})
