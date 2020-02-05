import React from 'react';

import { simpleRender, fireEvent } from 'test-utils';

import GeneralStepper, { StepperProps } from '../GeneralStepper';
import { MemoryRouter, Switch, Route } from 'react-router-dom';

const ExampleButtonComponent = ({ onComplete, onCompleteText }: any) => {
  return (
    <>
      <button onClick={() => onComplete(onCompleteText)}>Click Me</button>
    </>
  );
};

const ExampleButtonFinalComponent = ({
  onComplete,
  onCompleteText,
  resetFlow,
  completeButtonText
}: any) => {
  return (
    <>
      <button onClick={() => onComplete(onCompleteText)}>Click Me</button>
      <button onClick={() => resetFlow()}>{completeButtonText}</button>
    </>
  );
};

const functionTest = (textTriggered: string, cb: any) => {
  console.debug('textTriggered: ', textTriggered);
  cb();
};
const testSteps = [
  {
    label: 'Test Component 1',
    component: ExampleButtonComponent,
    props: { onCompleteText: 'Finished this1' },
    actions: (payload: any, cb: any) => functionTest(payload, cb)
  },
  {
    label: 'Test Component 2',
    component: ExampleButtonFinalComponent,
    props: { onCompleteText: 'Finished this2' },
    actions: (payload: any, cb: any) => functionTest(payload, cb)
  }
];

const defaultBackPath = '/dashboard';
const defaultBackPathLabel = 'Dashboard';
const completeBtnText = 'Finished';

const defaultProps: StepperProps = {
  steps: testSteps,
  defaultBackPath,
  defaultBackPathLabel,
  completeBtnText
};

describe('GeneralStepper', () => {
  let location: any;
  const StepperComponent = (props: StepperProps, path?: any) => (
    <MemoryRouter initialEntries={path ? [path] : undefined}>
      <Switch>
        <Route
          path="*"
          render={renderProps => {
            location = renderProps.location;
            return <GeneralStepper {...props} />;
          }}
        />
      </Switch>
    </MemoryRouter>
  );
  const renderComponent = (props: StepperProps) => simpleRender(<StepperComponent {...props} />);

  test('it renders step 1 correctly first', async () => {
    const { getByText } = renderComponent(defaultProps);
    const text = getByText('Test Component 1'); // The header for step 1
    expect(text).toBeInTheDocument();
  });
  test('it renders step 1 back button correctly', async () => {
    const { getByText } = renderComponent(defaultProps);
    const text = getByText(`Back : ${defaultBackPathLabel}`); // The back button from step 1
    expect(text).toBeInTheDocument();
  });
  test('it correctly reroutes on step 1 back button click', async () => {
    const { getByText } = renderComponent(defaultProps);
    const text = getByText(`Back : ${defaultBackPathLabel}`); // The back button from step 1
    fireEvent.click(text);
    expect(location.pathname).toEqual(defaultBackPath);
  });
  test('it renders step 2 when goToNext is clicked in step 1', async () => {
    const { getByText } = renderComponent(defaultProps);
    const text = getByText('Click Me');
    fireEvent.click(text); // Go to step 2
    const newText = getByText('Test Component 2'); // The header for step 2
    expect(newText).toBeInTheDocument();
  });
  test('it renders step 1 when back button is clicked from step 2', async () => {
    const { getByText } = renderComponent(defaultProps);
    const text = getByText('Click Me');
    fireEvent.click(text); // Go to step 2
    const goBackButton = getByText(`Back : Test Component 1`); // The back button when step 2 is rendered
    fireEvent.click(goBackButton);
    const stepOneText = getByText('Test Component 1'); // The header for step 1
    expect(stepOneText).toBeInTheDocument();
  });
  test('it resets flow when resetFlow button is clicked from final component', async () => {
    const { getByText } = renderComponent(defaultProps);
    const text = getByText('Click Me');
    fireEvent.click(text); // Go to step 2

    const resetFlowButton = getByText(completeBtnText); // The back button when step 2 is rendered
    fireEvent.click(resetFlowButton);
    const stepOneText = getByText('Test Component 1'); // The header for step 1
    expect(stepOneText).toBeInTheDocument();
  });
});
