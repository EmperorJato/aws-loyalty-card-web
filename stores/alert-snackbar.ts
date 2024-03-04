import { defineStore } from "pinia";

interface AlertSnackbar {
  show: Boolean;
  type: String;
  title: String;
  description: String;
  timeout: Number;
}

interface State {
  alertSnackbar: AlertSnackbar | null;
}

export const useAlertSnackbarStore = defineStore("alert-snackbar", {
  state: (): State => ({
    alertSnackbar: {
      show: false,
      type: "",
      title: "",
      description: "",
      timeout: 5000,
    },
  }),

  actions: {
    setAlertSnackbar(data: AlertSnackbar) {
      this.alertSnackbar = data;
    },
  },
});


