import { ToastProvider } from './components/Toast';
import { useHashRoute } from './hooks/useHashRoute';
import { Analytics } from './pages/Analytics';
import { Dashboard } from './pages/Dashboard';
import { EventDetail } from './pages/EventDetail';
import { EventForm } from './pages/EventForm';
import { GeneralExpenses } from './pages/GeneralExpenses';
import { PrintView } from './pages/PrintView';
import { TransactionForm } from './pages/TransactionForm';

function Router() {
  const [route, navigate, back] = useHashRoute();

  switch (route.name) {
    case 'dashboard':
      return <Dashboard route={route} navigate={navigate} />;

    case 'event-detail':
      return <EventDetail route={route} eventId={route.eventId} navigate={navigate} back={back} />;

    case 'event-form':
      return <EventForm route={route} eventId={route.eventId} navigate={navigate} back={back} />;

    case 'transaction-form':
      return (
        <TransactionForm
          route={route}
          kind="event"
          eventId={route.eventId}
          transactionId={route.transactionId}
          navigate={navigate}
          back={back}
          onSaved={() => {}}
        />
      );

    case 'general-expenses':
      return <GeneralExpenses route={route} navigate={navigate} />;

    case 'transaction-form-general':
      return (
        <TransactionForm
          route={route}
          kind="general"
          transactionId={route.transactionId}
          navigate={navigate}
          back={back}
          onSaved={() => {}}
        />
      );

    case 'print-view':
      return <PrintView route={route} eventId={route.eventId} navigate={navigate} back={back} />;

    case 'analytics':
      return <Analytics route={route} navigate={navigate} />;
  }
}

function App() {
  return (
    <ToastProvider>
      <Router />
    </ToastProvider>
  );
}

export default App;
