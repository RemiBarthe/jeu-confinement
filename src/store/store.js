import Vue from 'vue'
import Vuex from 'vuex'

import { db } from "../firebase"

export const IS_CURRENT_USER = 'IS_CURRENT_USER'
export const SET_USERS = 'SET_USERS'
export const SET_ROUND = 'SET_ROUND'
export const SET_QUESTIONS = 'SET_QUESTIONS'
export const SET_SHOW_SCORE = 'SET_SHOW_SCORE'


Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        currentUser: null,
        currentRoom: null,
        isHost: null,
        round: null,
        users: [],
        questions: [],
        showScore: false
    },
    getters: {

    },
    actions: {
        joinRoom({ commit }, payload) {
            const idRoom = payload.idRoom.toString()
            const idUser = payload.id.toString()

            db.collection("rooms").doc(idRoom).collection("users").doc(idUser).set({ name: payload.name, avatar: payload.avatar, answer: "", voteFor: "", score: 0 })
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
            const idRoom = payload.toString()
            db.collection("questions").get().then(function (querySnapshot) {
                let questionsArray = []
                querySnapshot.forEach(function (doc) {
                    db.collection("rooms").doc(idRoom).collection("questions").doc(doc.id).set(doc.data())
                    let question = doc.data()
                    question.id = doc.id
                    questionsArray.push(question)
                })

                commit(SET_QUESTIONS, questionsArray)
            })
        },
        getQuestions({ commit }, payload) {
            const idRoom = payload.toString()
            db.collection("rooms").doc(idRoom).collection("questions").get().then(function (querySnapshot) {
                let questionsArray = []
                querySnapshot.forEach(function (doc) {
                    let question = doc.data()
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
        setShowScore({ commit }, payload) {
            commit(SET_SHOW_SCORE, payload)
        }
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
        },
        [SET_SHOW_SCORE](state, payload) {
            state.showScore = payload
        }
    }
})
