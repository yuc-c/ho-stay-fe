import { ref } from "vue";
import { defineStore } from "pinia";

export default defineStore('user', () => {
    const userId = ref(null);
    const token = ref("");
    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const phone = ref("");
    const validateEmail = ref("");
    const role = ref([])
    const id = ref("");
    const photo = ref("");
    function setUserId(id) {
        userId.value = id;
    }
    function setId(data) {
        id.value = data;
    }
    function setrole(data) {
        role.value = data;
    }
    function setValidateEmail(mail) {
        validateEmail.value = mail;
    }
    function setToken(data) {
        token.value = data;
    }
    function getToken() {
        return token.value;
    }
    function setFirstName(name) {
        firstName.value = name;
    }
    function setLastName(name) {
        lastName.value = name;
    }

    function setEmail(mail) {
        email.value = mail;
    }
    function setPhone(data) {
        phone.value = data;
    }
    function setPhoto(data) {
        photo.value = data;
    }
    function clearUser() {
        token.value = "";
        id.value = "";
        firstName.value = "";
        lastName.value = "";
        email.value = "";
        userId.value = 0;   // 你的（客服需要）
        role.value = [];    // 組員也需要清空角色
        phone.value = "";
        photo.value = "";
    }

    return {
        userId, setUserId,
        token, setToken, getToken,
        id, setId,
        firstName, setFirstName,
        lastName, setLastName,
        email, setEmail,
        phone, setPhone,
        validateEmail, setValidateEmail,
        role, setrole,
        photo, setPhoto,
        clearUser
    };
}, {
    persist: {
        key: "hoUser",
        storage: sessionStorage
    }
})