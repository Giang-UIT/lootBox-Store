

<script setup lang ="ts">

import { ref, onMounted} from 'vue'
import api from '@/api'

//Just for testing. If the array is still here, deletes it. 
const testAccounts: accountInfo[] = [
  {id: 1, name: "name1", password:"pass1", email:"email1", admin_status:false, time_created:"asd"},
  {id: 2, name: "name2", password:"pass2", email:"email2", admin_status:false, time_created:"asd"},
  {id: 3, name: "name3", password:"pass3", email:"email3", admin_status:true, time_created:"asd"}
]

//account array where each index is an object. Think of object as a python dictionary that can also store functions
//replace testAccounts with an empty array (i.e []) after removing testAccounts 
const account = ref<accountInfo[]>(testAccounts) 
const AccountInfos = <accountInfo | any>ref(null)

interface accountInfo { 
    id: number, 
    name: string, 
    password: string, 
    email: string, 
    admin_status: boolean, 
    time_created: string //what is the "timedate" equivalent for TS?
}

//This takes an account id, searches the account array to find the right object and returns it
const displayingDetails = (id: number) => AccountInfos.value = account.value.find(a => a.id === id) ?? null

/* ==================== HTTP REQUESTS ==================== */

//Get method.
const fetchUser = async () => {

  try { 
    const response = await api.get('/getUser/')
    
    account.value = response.data
  
  } catch (error){
    console.log('error')
  }
}


//Delete method. Takes an account id and send delete request to backend
//Not sure if this is how it works
const deleteAccount = async (id:number) => {
  try { 
    const response = await api.delete('/deleteUser/')
    console.log(response.status)
    
  } catch (error){
    console.log(id)
    console.log('error')
  }  
}

//Put method. Takes an account id and send put request to backend
//Not sure if this is how it works
const editAccount = async (id:number) => {
  try { 
    const response = await api.put('/deleteUser/')
    console.log(response.status) 
  } catch (error){
    console.log('error')
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

                            <v-list-item :title = item.email :subtitle= item.id> 
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
                <v-card height="320">
                    <!-- the texts are binded to "AccountInfos"-->
                    <v-card-text >Email: {{ AccountInfos?.email }} </v-card-text>
                    <v-card-text >name: {{ AccountInfos?.name }} </v-card-text>
                    <v-card-text >status: {{ AccountInfos?.admin_status }} </v-card-text>
                    <v-card-text >created date: {{ AccountInfos?.time_created }} </v-card-text>
                                        
                </v-card>
            </v-col>
        </v-row>
        
        <!-- adds a container to make the buttons stay in the middle-->
        <v-container class="d-flex justify-center">

            <v-btn rounded="lg" style="background-color: white; color: red;" class="ma-2" @click = deleteAccount(AccountInfos?.id)>Delete account</v-btn>
            <v-btn rounded = "lg" style="background-color: white; color: black;" class="ma-2" @click = editAccount(AccountInfos?.id)>Edit account</v-btn>
        </v-container>

    </v-container>
</v-main>

</template>

<style scoped>


</style>