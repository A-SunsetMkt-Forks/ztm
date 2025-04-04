<script setup>
import { ref, onMounted,onBeforeUnmount, onActivated, watch, computed } from "vue";
import { useStore } from 'vuex';
import ChatService from '@/service/ChatService';
import _ from 'lodash';
import { openFolder } from '@/utils/file';
import { isPC } from '@/utils/platform';
import userSvg from "@/assets/img/user.png";
import { useI18n } from 'vue-i18n';
const { t, locale } = useI18n();
const store = useStore();
const chatService = new ChatService();
const props = defineProps(['room']);
const emits = defineEmits(['back','history','update:room']);
const selectedMesh = computed(() => {
	return store.getters["account/selectedMesh"]
});
const visibleUserSelector = ref(false);

const hasPC = computed(()=> isPC());
const selectedNewChatUsers = ref({});

const loading = ref(false);
const saving = ref(false);
const appendGroupUsers = () => {
	const users = Object.keys(selectedNewChatUsers.value) || [];
	saving.value = true;
	chatService.appendGroupMembers({
		group:props?.room?.group,
		creator:props?.room?.creator,
		members:users.concat([selectedMesh.value?.agent?.username]), 
		callback(res){
			emits('update:room',res);
			saving.value = false;
			selectedNewChatUsers.value = {};
			visibleUserSelector.value = false;
		}
	});
}
const exitGroupUsers = (member) => {
	loading.value = true;
	chatService.exitGroupMembers({
		group:props?.room?.group,
		creator:props?.room?.creator,
		member, 
		callback(res){
			emits('update:room',res);
			loading.value = false;
			selectedNewChatUsers.value = {};
			visibleUserSelector.value = false;
		}
	});
}
const invite = () => {
	const users = props?.room?.members || [];
	visibleUserSelector.value = true;
	selectedNewChatUsers.value = {}
	users.filter((user) => user != selectedMesh.value?.agent?.username).forEach((user)=>{
		selectedNewChatUsers.value[user] = { "checked": true, "partialChecked": false };
	})
}

const back = () => {
	emits('back')
}
const newName = ref('');
const saveName = () => {
	saving.value = true;
	chatService.setGroupName({
		group:props?.room?.group,
		creator:props?.room?.creator,
		name: newName.value, 
		callback(res){
			saving.value = false;
			emits('update:room',res);
		}
	});
}
const history = () => {
	emits('history');
}
const openBox = () => {
	const mesh = selectedMesh.value?.name;
	const base = props.room?.peer || props.room?.group;
	openFolder(`ztmChat/${mesh}/${base}`)
}
watch(() => props.room, () => {
	newName.value = props.room?.name || '';
},{
	deep:true,
	immediate: true
})
</script>
<template>
	
	<AppHeader :back="back">
	    <template #center>
	      <b>{{t('Setting')}}</b>
	    </template>
	    <template #end> 
				<Button :loading="loading" icon="pi pi-cog"  severity="secondary" text />
			</template>
	</AppHeader>
	<ul class="nav-ul">
		<li class="nav-li" style="padding: 0;line-height: 30px;">
			<div class="grid text-center py-4 m-0" v-if="props.room.members">
					<div  
						v-for="(member) in props.room.members"
						class="py-2 relative text-center col-3" >
						<Avatar v-longtap="() => exitGroupUsers(member)" icon="pi pi-user" size="large" style="margin: auto;" />
						<div class="mt-1" v-tooltip="member" style="line-height: 16px;text-overflow: ellipsis;overflow: hidden;white-space: nowrap;">
							<b  style="">
								{{ member}}
							</b>
						</div>
					</div>
					<div
						class="py-2 relative text-center col-3" >
						<Avatar @click="invite" class="pointer" icon="pi pi-plus" size="large" style="margin: auto;" />
					</div>
			</div>
		</li>
	</ul>
	<ul class="nav-ul" :class="{'mt-2':props.room.group}">
		<li class="nav-li flex" v-if="props.room.group">
			<b class="opacity-70">Group</b>
			<div class="flex-item text-right">
				<InputText type="text" v-model="newName" :unstyled="true"/>
			</div>
			<Button :disabled="!newName" @click="saveName" :loading="saving" v-if="newName != props.room?.name" icon="pi pi-check" text severity="success" />
		</li>
		<li class="nav-li flex" v-else-if="props.room.peer">
			<b class="opacity-70">{{t('Peer')}}</b>
			<div class="flex-item text-right pr-3">
				<img :src="userSvg" width="18px" height="18px" class="relative mr-1" style="top:4px"/> {{props.room.peer}}
			</div>
		</li>
		<li class="nav-li flex" @click="history">
			<b class="opacity-70">{{t('History')}}</b>
			<div class="flex-item">
				
			</div>
			<i class="pi pi-angle-right"/>
		</li>
		<li v-if="hasPC" class="nav-li flex" @click="openBox">
			<b class="opacity-70">{{t('Files')}}</b>
			<div class="flex-item">
			</div>
			<i class="pi pi-external-link"/>
		</li>
	</ul>
	<ul class="nav-ul mt-2" v-if="props.room.group">
		<li class="nav-li flex pl-0">
			<Button class="w-full" @click="exitGroupUsers(selectedMesh?.agent?.username)" label="Exit Group" :loading="saving" icon="pi pi-trash" text severity="danger" />
		</li>
	</ul>
	
	<Dialog class="noheader" v-model:visible="visibleUserSelector" modal header="Invite" :style="{ width: '25rem' }">
			<AppHeader :back="() => visibleUserSelector = false" :main="false">
					<template #center>
						<b>{{t('Invite')}} <Badge class="ml-2 relative" style="top:-2px" v-if="Object.keys(selectedNewChatUsers).length>0" :value="Object.keys(selectedNewChatUsers).length"/></b>
					</template>
			
					<template #end> 
						<Button icon="pi pi-check" @click="appendGroupUsers" :disabled="Object.keys(selectedNewChatUsers).length==0"/>
					</template>
			</AppHeader>
			<UserSelector
				:app="true" 
				size="small"
				class="w-full"
				:mesh="selectedMesh"
				multiple="tree" 
				:user="selectedMesh?.agent?.username" 
				v-model="selectedNewChatUsers" />
	</Dialog>
</template>


<style>
</style>