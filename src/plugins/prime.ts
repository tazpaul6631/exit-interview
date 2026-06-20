import { App } from 'vue';

// Import các Component bạn cần
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Tag from 'primevue/tag';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import Checkbox from 'primevue/checkbox';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Password from 'primevue/password';
import Avatar from 'primevue/avatar';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';
import Skeleton from 'primevue/skeleton';
import FloatLabel from 'primevue/floatlabel';
import 'primeicons/primeicons.css';

export default {
    install: (app: App) => {
        app.component('DataTable', DataTable);
        app.component('Column', Column);
        app.component('InputText', InputText);
        app.component('IconField', IconField);
        app.component('InputIcon', InputIcon);
        app.component('Tag', Tag);
        app.component('Select', Select);
        app.component('MultiSelect', MultiSelect);
        app.component('Checkbox', Checkbox);
        app.component('DatePicker', DatePicker);
        app.component('Button', Button);
        app.component('Dialog', Dialog);
        app.component('Password', Password);
        app.component('Avatar', Avatar);
        app.component('Toast', Toast);
        app.component('ProgressBar', ProgressBar);
        app.component('Skeleton', Skeleton);
        app.component('FloatLabel', FloatLabel);
    }
};