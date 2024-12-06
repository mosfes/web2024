const { createApp } = Vue;
const { createVuetify } = Vuetify;

const vuetify = createVuetify({
    theme: {
        themes: {
            dark: {
                colors: {
                    background: '#121212',
                    surface: '#1e1e1e',
                    primary: '#ffcc00',
                    secondary: '#03dac6',
                    error: '#cf6679',
                    text: '#ffffff', /* กำหนดสีข้อความเป็นสีขาว */
                },
            },
        },
        dark: true,
    },
});

const app = createApp({
    data() {
        return {
            qlist: [],
            answers: [],
            score: 0,
            page: 1,
        };
    },
    mounted() {
        this.loadQuestions();
    },
    methods: {
        async loadQuestions() {
            const response = await fetch('./quiz.json');
            this.qlist = await response.json();
        },
        validate() {
            return this.answers.length === this.qlist.length && !this.answers.includes(undefined);
        },
        grading() {
            this.score = this.qlist.reduce((total, question, index) => {
                return total + (this.answers[index] === question.answer ? 1 : 0);
            }, 0);
            this.page = 3;
        },
        restart() {
            this.answers = [];
            this.score = 0;
            this.page = 1;
        },
    },
});

app.use(vuetify).mount('#app');
