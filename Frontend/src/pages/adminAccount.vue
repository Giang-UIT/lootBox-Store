

<script setup lang ="ts">

import { ref, onMounted} from 'vue'
import api from '@/api'
import { useRouter } from 'vue-router'


//Just for testing. If the array is still here, deletes it. 
const testAccounts: accountInfo[] = [
  {id: 1, name: "name1", password:"pass1", email:"email1", admin_status:false, time_created:"asd"},
  {id: 2, name: "name2", password:"pass2", email:"email2", admin_status:false, time_created:"asd"},
  {id: 3, name: "name3", password:"pass3", email:"email3", admin_status:true, time_created:"asd"}
]

//account array where each index is an object. Think of object as a python dictionary that can also store functions
//replace testAccounts with an empty array (i.e []) after removing testAccounts 
const account = ref<accountInfo[]>([]) 
const AccountInfos = ref<accountInfo[] | any>([])
const msg = ref(``)
const isDelete = ref<boolean| null>(null)
const isEdit = ref<boolean | null>(null)

interface accountInfo { 
    id: number, 
    name: string, 
    password: string, 
    email: string, 
    admin_status: boolean, 
    time_created: string //what is the "timedate" equivalent for TS?
}


//This takes an account id, searches the account array to find the right object and returns it
//Also reset errMsg so that account details can be shown
function displayingDetails (id: number){
  msg.value = ''
  AccountInfos.value = account.value.find(a => a.id === id) ?? null
}  

/* ==================== HTTP REQUESTS ==================== */

//Get method.
const fetchUser = async () => {

  try { 
    const response = await api.get('/getUser/')
    
    account.value = response.data.accounts
  
  } catch (error: any){
    msg.value = `an error has occured. Status code: ${error.status}`
  }
}


//Delete method. Takes an account id and send delete request to backend
const deleteAccount = async (id:number) => {
  isDelete.value = null
  try { 

    const response = await api.delete(`/deleteUser/${id}`)
    fetchUser()
    console.log(response.status)
    msg.value = "The account is successfully deleted"
  } catch (error: any){
    msg.value = `Could not delete the account with the id of ${id}. Status code: ${error.status}`
  }  
}

//Put method. Takes an account id and send put request to backend
const editAccount = async (account:any) => {
  console.log(account)
  if (!account.password || !account.email || !account.name) {
    msg.value = "name, email or password cannot be empy!"
    return
  }

  try {
    const response = await api.put('/editAccount/', account)
    console.log(response.status) 
    msg.value = "The account is successfully edited"
  } catch (error: any){
    msg.value = "Could not edit the account with the id of" + account.id + "Status code: " + error.status
  }  
}

/* =========================================================== */

 //This ensures that fetchUser will always run after opening this page
onMounted(() => {
  fetchUser();
  
});
</script>

<template> 



<v-main>
    <v-sheet class="d-flex align-center justify-center text-center">
        <h2>Account admin</h2>
    </v-sheet>

    <v-container style="background-color: whitesmoke; border-radius: 10px; border: 2px solid black;"> 
        
      <!-- This creates a 1x2 grid system. Basically the list section and account detail section-->
        <v-row> 

            <v-col>     
                <v-card>
                  <!-- Virtual-scroll allows the list to only render enough data to fit in the section. It allows for better performance -->
                    <v-virtual-scroll :items="account" height="320" item-height="48">
                        
                      <!-- this template tag basically creates a child component 
                       and renders the every index of "account" in the child component. (item = every account object) -->

                          <template v-slot:default="{ item }">

                            <v-list-item :title = item.email :subtitle="`account id: ${item.id}`"> 
                                <template v-slot:prepend> 
                                    <v-icon>mdi-account</v-icon>
                                </template>

                                <template v-slot:append> 
                                    <v-btn icon="mdi-pencil" size="x-small" variant="tonal" @click="displayingDetails(item.id)"></v-btn>
                                </template>
                            </v-list-item>
                          </template>
                            
                            
                    </v-virtual-scroll>
                </v-card>
            </v-col>
        
        <!-- this divider adds the vertical line between the sections -->
        <v-divider vertical class="border-opacity-100"></v-divider>
        
            <v-col>
                <v-card v-if = "!msg" height="320">
                    <!-- the texts are binded to "AccountInfos"-->
                    <v-card-text>
                      <v-text-field v-model = "AccountInfos.email" label = "Email" variant= "underlined"></v-text-field>
                      <v-text-field v-model = "AccountInfos.password" label = "Password" variant= "underlined"></v-text-field>
                      <v-text-field v-model = "AccountInfos.name" label = "Name" variant= "underlined"></v-text-field>
                      <v-checkbox v-model="AccountInfos.admin_status" label="Admin Status"></v-checkbox>
                    </v-card-text>
                    
                    <v-card-text >Admin Status: {{ AccountInfos?.admin_status ? 1 : 0 }} </v-card-text>
                    
                    
                                        
                </v-card>
                <v-card v-else>
                  <v-card-text>{{ msg }}</v-card-text>
                </v-card>
            </v-col>
        </v-row>
        
        <!-- adds a container to make the buttons stay in the middle-->
        <v-container class="d-flex justify-center">
          <v-btn v-if ="isDelete" rounded="lg" style="background-color: white; color: red;" class="ma-2" @click = deleteAccount(AccountInfos?.id)>Confirm</v-btn>
          <v-btn v-if ="isDelete" rounded="lg" class="ma-2" @click = "isDelete = false">Cancel</v-btn>
          <v-btn v-else rounded="lg" class="ma-2" @click = "isDelete = true">Delete account</v-btn>
          
          <v-btn v-if ="isEdit" rounded="lg" style="background-color: white; color: green;" class="ma-2" @click = editAccount(AccountInfos)>Confirm</v-btn>
          <v-btn v-if ="isEdit" rounded="lg" class="ma-2" @click = "isEdit = false">Cancel</v-btn>
          <v-btn v-else rounded = "lg" style="background-color: white; color: black;" class="ma-2" @click = "isEdit = true">Edit account</v-btn>
        </v-container>

    </v-container>
</v-main>

</template>

<style scoped>


</style>