<template>
  <v-data-table :headers="headers" :items="loyaltyCards" theme="dark">
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Loyalty Cards</v-toolbar-title>
        <v-divider class="mx-4" inset vertical></v-divider>
        <v-spacer></v-spacer>
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ props }">
            <v-btn color="primary" dark class="mb-2" v-bind="props">
              New Item
            </v-btn>
            <v-btn
              class="mb-2"
              color="success"
              prepend-icon="mdi-cloud-upload"
              :loading="isSelecting"
              @click="onButtonClick"
              >{{ uploadTitle }}</v-btn
            >
            <input
              ref="uploadFile"
              class="d-none"
              type="file"
              accept=".csv"
              @change="onFileChanged"
            />
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editedItem.CardNumber"
                      label="Card Number"
                      variant="outlined"
                      :disabled="disableCardNumber"
                    ></v-text-field>
                    <v-text-field
                      v-model="editedItem.FirstName"
                      label="First Name"
                      variant="outlined"
                    ></v-text-field>
                    <v-text-field
                      v-model="editedItem.LastName"
                      label="Last Name"
                      variant="outlined"
                    ></v-text-field>
                    <v-text-field
                      v-model="editedItem.Points"
                      label="Points"
                      variant="outlined"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="close">
                Cancel
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="save"
                :loading="loadingSave"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue-darken-1" variant="text" @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template v-slot:[`item.actions`]="{ item }">
      <v-icon size="small" class="me-2" @click="editItem(item)">
        mdi-pencil
      </v-icon>
      <v-icon size="small" @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
    <template v-slot:no-data>
      <v-btn color="primary" @click="initialize"> Reset </v-btn>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useAlertSnackbarStore } from "~/stores/alert-snackbar";
import LoyaltyCard from '~/interfaces/LoyaltyCardInterface'

const useAlert = useAlertSnackbarStore();

const axios = useNuxtApp().$axios;

const dialog = ref<Boolean> (false);
const dialogDelete = ref<Boolean>(false);

const headers = ref<Array>([
  {
    title: "Card Number",
    align: "start",
    key: "CardNumber",
  },
  { title: "First Name", key: "FirstName" },
  { title: "Last Name", key: "LastName" },
  { title: "Points", key: "Points" },
  { title: "Actions", key: "actions", sortable: false },
]);


const loyaltyCards = ref([]);
const editedIndex = ref(-1);
const editedItem = ref({
  CardNumber: "",
  FirstName: "",
  LastName: "",
  Points: 0,
});
const defaultItem = ref({
  CardNumber: "",
  FirstName: "",
  LastName: "",
  Points: 0,
});
const loadingSave = ref(false);

const disableCardNumber = ref(false);

const formTitle = computed(() => {
  return editedIndex.value === -1 ? "New Loyalty Card" : "Edit Loyalty Card";
});

const selectedFile = ref(null);
const isSelecting = ref(false);
const defaultUploadTitle = ref("Upload");
const uploadFile = ref(null);

const uploadTitle = computed(() => {
  return selectedFile.value ? selectedFile.name : defaultUploadTitle.value;
});

const initialize = async () => {
  await axios.get("/loyalty-cards").then((res) => {
    loyaltyCards.value = res.data.data;

    const alert = {
      show: true,
      type: "success",
      title: "Success",
      description: res.data.message,
      timeout: 5000,
    };

    useAlert.setAlertSnackbar(alert);
  });
};

function editItem(item) {
  console.log("LOYALTY CARD", item.CardNumber);
  disableCardNumber.value = true;
  editedIndex.value = loyaltyCards.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
}

const deleteItem = (item) => {
  editedIndex.value = loyaltyCards.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialogDelete.value = true;
};

const deleteItemConfirm = async () => {
  console.log("DELETE", editedItem.value?.CardNumber);

  let alert = {};

  await axios
    .delete(`/loyalty-card?CardNumber=${editedItem.value?.CardNumber}`)
    .then((res) => {
      loyaltyCards.value.splice(editedIndex.value, 1);
      console.log(res);
      alert = {
        show: true,
        type: "success",
        title: "Success",
        description: res.data.message,
        timeout: 5000,
      };
    })
    .catch((err) => {
      alert = {
        show: true,
        type: "error",
        title: "Server Error",
        description: err,
        timeout: 5000,
      };
      console.log(err);
    })
    .then(() => {
      useAlert.setAlertSnackbar(alert);
      closeDelete();
    });
};

function close() {
  dialogDelete.value = false;
  loadingSave.value = false;
  dialog.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}

function closeDelete() {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}

function onButtonClick(e) {
  isSelecting.value = true;

  console.log("uploader", uploadFile);

  window.addEventListener(
    "focus",
    () => {
      isSelecting.value = false;
    },
    { once: true }
  );

  uploadFile.value.click();
}

function onFileChanged(e) {
  console.log("SELECTED FILE", e.target.files[0]);
  selectedFile.value = e.target.files[0];

  const fileSelected = e.target.files[0];

  console.log("SELECTED FILE VALUE", typeof fileSelected);

  const selectedFileString = JSON.stringify(fileSelected);

  console.log("selectedFileString", selectedFileString);

   const formData = new FormData();
  formData.append('file', fileSelected);

  console.log(formData);

  axios
    .post(
      "https://el6cya0kz3.execute-api.ap-northeast-1.amazonaws.com/loyalty-card/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}

async function save() {
  let alert = {};
  loadingSave.value = true;

  if (editedIndex.value > -1) {
    await axios
      .put(
        `/loyalty-card?CardNumber=${editedItem.value.CardNumber}`,
        editedItem.value
      )
      .then((res) => {
        alert = {
          show: true,
          type: "success",
          title: "Success",
          description: res.data.message,
          timeout: 5000,
        };
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    Object.assign(loyaltyCards.value[editedIndex.value], editedItem.value);
  } else {
    await axios.post("/loyalty-card", editedItem.value).then((res) => {
      loyaltyCards.value.push(editedItem.value);
      alert = {
        show: true,
        type: "success",
        title: "Success",
        description: res.data.message,
        timeout: 5000,
      };
      console.log("RESPONSE", res);
    });
  }
  useAlert.setAlertSnackbar(alert);
  close();
}

computed;
watch(dialog, (val) => {
  val || close();
});
watch(dialogDelete, (val) => {
  val || closeDelete();
});
initialize();
</script>
