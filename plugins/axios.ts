import axios from 'axios'

export default defineNuxtPlugin(nuxtApp => {
    const instance = axios.create({
        withCredentials: true,
        baseURL: 'https://el6cya0kz3.execute-api.ap-northeast-1.amazonaws.com',
        headers: {
            Accept : 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'user-allow'
        }
    })

    return {
        provide : {
            axios: instance
        }
    }
})