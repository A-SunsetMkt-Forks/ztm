import AutoComplete from 'primevue/autocomplete';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';
import Avatar from 'primevue/avatar';
import AvatarGroup from 'primevue/avatargroup';
import Badge from 'primevue/badge';
import BlockUI from 'primevue/blockui';
import Button from 'primevue/button';
import Breadcrumb from 'primevue/breadcrumb';
import Drawer from 'primevue/drawer';
import Calendar from 'primevue/calendar';
import Chart from 'primevue/chart';
import CascadeSelect from 'primevue/cascadeselect';
import Carousel from 'primevue/carousel';
import Checkbox from 'primevue/checkbox';
import Chip from 'primevue/chip';
import Chips from 'primevue/chips';
import ColorPicker from 'primevue/colorpicker';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import MeterGroup from 'primevue/metergroup';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmPopup from 'primevue/confirmpopup';
import ContextMenu from 'primevue/contextmenu';
import DataTable from 'primevue/datatable';
import DataView from 'primevue/dataview';
import Select from 'primevue/select';
import DataViewLayoutOptions from '@/components/common/DataViewLayoutOptions.vue';
import DeferredContent from 'primevue/deferredcontent';
import Popover from 'primevue/popover';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import Dock from 'primevue/dock';
import DynamicDialog from 'primevue/dynamicdialog';
import Fieldset from 'primevue/fieldset';
import FileUpload from 'primevue/fileupload';
import Galleria from 'primevue/galleria';
import Image from 'primevue/image';
import InlineMessage from 'primevue/inlinemessage';
import Inplace from 'primevue/inplace';
import InputSwitch from 'primevue/inputswitch';
import ToggleSwitch from 'primevue/toggleswitch';
import InputText from 'primevue/inputtext';
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import InputMask from 'primevue/inputmask';
import InputNumber from 'primevue/inputnumber';
import Knob from 'primevue/knob';
import Listbox from 'primevue/listbox';
import MegaMenu from 'primevue/megamenu';
import Menu from 'primevue/menu';
import Menubar from 'primevue/menubar';
import Message from 'primevue/message';
import MultiSelect from 'primevue/multiselect';
import OrderList from 'primevue/orderlist';
import OrganizationChart from 'primevue/organizationchart';
import OverlayPanel from 'primevue/overlaypanel';
import Paginator from 'primevue/paginator';
import Panel from 'primevue/panel';
import PanelMenu from 'primevue/panelmenu';
import Password from 'primevue/password';
import PickList from 'primevue/picklist';
import ProgressBar from 'primevue/progressbar';
import DatePicker from 'primevue/datepicker';
import ProgressSpinner from 'primevue/progressspinner';
import Rating from 'primevue/rating';
import RadioButton from 'primevue/radiobutton';

import Row from 'primevue/row';
import SelectButton from 'primevue/selectbutton';
import ScrollPanel from 'primevue/scrollpanel';
import ScrollTop from 'primevue/scrolltop';
import Skeleton from 'primevue/skeleton';
import Slider from 'primevue/slider';
import Sidebar from 'primevue/sidebar';
import SpeedDial from 'primevue/speeddial';
import SplitButton from 'primevue/splitbutton';
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import Steps from 'primevue/steps';

import TabMenu from 'primevue/tabmenu';
import TieredMenu from 'primevue/tieredmenu';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Toolbar from 'primevue/toolbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Terminal from 'primevue/terminal';
import Timeline from 'primevue/timeline';
import ToggleButton from 'primevue/togglebutton';
import Tree from 'primevue/tree';
import TreeSelect from 'primevue/treeselect';
import TreeTable from 'primevue/treetable';
import VirtualScroller from 'primevue/virtualscroller';
import BlockViewer from '@/components/BlockViewer.vue';
import ChipList from '@/components/ChipList.vue';
import Loading from '@/components/Loading.vue';
import Status from '@/components/Status.vue';
import Card from '@/components/common/Card.vue';
import Empty from '@/components/common/Empty.vue';
import FormItem from '@/components/common/FormItem.vue';
import FloatField from '@/components/common/FloatField.vue';
import HiddenField from '@/components/common/HiddenField.vue';
import InputList from '@/components/common/InputList.vue';
import AppHeader from '@/components/common/AppHeader.vue';
import CertificateUploder from '@/components/common/CertificateUploder.vue';
import FileUploderSmall from '@/components/common/FileUploderSmall.vue';
import FileFolderSelector from '@/components/common/FileFolderSelector.vue';
import FileImportSelector from '@/components/common/FileImportSelector.vue';
import FilePreview from '@/components/common/FilePreview.vue';
import MeshSelector from '@/components/mesh/MeshSelector.vue';
import Forward from '@/components/share/Forward.vue';
import WatchShared from '@/components/share/WatchShared.vue';
import DrawMenu from '@/components/common/DrawMenu.vue';
import FloatLabel from 'primevue/floatlabel';

import { Field, Form, ErrorMessage } from 'vee-validate';

export function useComponent(app){
	
	app.component('Field', Field);
	app.component('Form', Form);
	app.component('ErrorMessage', ErrorMessage);
	app.component('Loading', Loading);
	app.component('BlockViewer', BlockViewer);
	app.component('Accordion', Accordion);
	app.component('AccordionTab', AccordionTab);
	app.component('AccordionPanel', AccordionPanel);
	app.component('AccordionHeader', AccordionHeader);
	app.component('AccordionContent', AccordionContent);
	app.component('AutoComplete', AutoComplete);
	app.component('Avatar', Avatar);
	app.component('AvatarGroup', AvatarGroup);
	app.component('Badge', Badge);
	app.component('BlockUI', BlockUI);
	app.component('Breadcrumb', Breadcrumb);
	app.component('Button', Button);
	app.component('Calendar', Calendar);
	app.component('Card', Card);
	app.component('Chart', Chart);
	app.component('Carousel', Carousel);
	app.component('CascadeSelect', CascadeSelect);
	app.component('Checkbox', Checkbox);
	app.component('Chip', Chip);
	app.component('Chips', Chips);
	app.component('ColorPicker', ColorPicker);
	app.component('Column', Column);
	app.component('ColumnGroup', ColumnGroup);
	app.component('ConfirmDialog', ConfirmDialog);
	app.component('ConfirmPopup', ConfirmPopup);
	app.component('ContextMenu', ContextMenu);
	app.component('DataTable', DataTable);
	app.component('DataView', DataView);
	app.component('DataViewLayoutOptions', DataViewLayoutOptions);
	app.component('DeferredContent', DeferredContent);
	app.component('Dialog', Dialog);
	app.component('Divider', Divider);
	app.component('Dock', Dock);
	app.component('MeterGroup', MeterGroup);
	app.component('DynamicDialog', DynamicDialog);
	app.component('Popover', Popover);
	app.component('Fieldset', Fieldset);
	app.component('FileUpload', FileUpload);
	app.component('Galleria', Galleria);
	app.component('Image', Image);
	app.component('InlineMessage', InlineMessage);
	app.component('Inplace', Inplace);
	app.component('InputMask', InputMask);
	app.component('InputNumber', InputNumber);
	app.component('InputSwitch', InputSwitch);
	app.component('ToggleSwitch', ToggleSwitch);
	app.component('InputText', InputText);
	app.component('Knob', Knob);
	app.component('Listbox', Listbox);
	app.component('MegaMenu', MegaMenu);
	app.component('Menu', Menu);
	app.component('Menubar', Menubar);
	app.component('Message', Message);
	app.component('MultiSelect', MultiSelect);
	app.component('OrderList', OrderList);
	app.component('OrganizationChart', OrganizationChart);
	app.component('OverlayPanel', OverlayPanel);
	app.component('Paginator', Paginator);
	app.component('Panel', Panel);
	app.component('PanelMenu', PanelMenu);
	app.component('Password', Password);
	app.component('PickList', PickList);
	app.component('ProgressBar', ProgressBar);
	app.component('DatePicker', DatePicker);
	app.component('ProgressSpinner', ProgressSpinner);
	app.component('RadioButton', RadioButton);
	app.component('Rating', Rating);
	app.component('Row', Row);
	app.component('SelectButton', SelectButton);
	app.component('Select', Select);
	app.component('ScrollPanel', ScrollPanel);
	app.component('ScrollTop', ScrollTop);
	app.component('Slider', Slider);
	app.component('Sidebar', Sidebar);
	app.component('Skeleton', Skeleton);
	app.component('SpeedDial', SpeedDial);
	app.component('SplitButton', SplitButton);
	app.component('Splitter', Splitter);
	app.component('SplitterPanel', SplitterPanel);
	app.component('Steps', Steps);
	app.component('TabMenu', TabMenu);
	app.component('TabView', TabView);
	app.component('TabPanel', TabPanel);
	app.component('Tag', Tag);
	app.component('Textarea', Textarea);
	app.component('Terminal', Terminal);
	app.component('TieredMenu', TieredMenu);
	app.component('Timeline', Timeline);
	app.component('Toast', Toast);
	app.component('Toolbar', Toolbar);
	app.component('ToggleButton', ToggleButton);
	app.component('Tree', Tree);
	app.component('TreeSelect', TreeSelect);
	app.component('TreeTable', TreeTable);
	app.component('VirtualScroller', VirtualScroller);
	app.component('InputGroup', InputGroup);
	app.component('InputGroupAddon', InputGroupAddon);
	app.component('ChipList', ChipList);
	app.component('Status', Status);
	app.component('AppHeader', AppHeader);
	app.component('FormItem', FormItem);
	app.component('FloatField', FloatField);
	app.component('FloatLabel', FloatLabel);
	app.component('InputList', InputList);
	app.component('HiddenField', HiddenField);
	app.component('CertificateUploder', CertificateUploder);
	app.component('FileUploderSmall', FileUploderSmall);
	app.component('FileFolderSelector', FileFolderSelector);
	app.component('FileImportSelector', FileImportSelector);
	app.component('FilePreview', FilePreview);
	app.component('MeshSelector', MeshSelector);
	app.component('Empty', Empty);
	app.component('Drawer', Drawer);
	app.component('Forward', Forward);
	app.component('WatchShared', WatchShared);
	app.component('DrawMenu', DrawMenu);
}
