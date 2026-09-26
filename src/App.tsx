import { Provider } from 'react-redux';
import { store } from './redux/store';
import Layout from './components/Layout';
import DailyLog from './components/DailyView';
import FoodForm from './components/FoodForm';

function App() {
    return (
        <Provider store={store}>
            <Layout>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <FoodForm />
                    </div>
                    <div className="lg:col-span-2">
                        <DailyLog />
                    </div>
                </div>
            </Layout>
        </Provider>
    );
}

export default App;
