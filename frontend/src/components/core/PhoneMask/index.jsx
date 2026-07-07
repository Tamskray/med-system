import { forwardRef } from "react";
import { PatternFormat } from "react-number-format";

const PhoneMask = forwardRef(function PhoneMask(props, ref) {
  const { onChange, ...other } = props;

  return (
    <PatternFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value === "" ? "" : values.formattedValue,
          },
        });
      }}
      format="+38 ### ### ## ##"
      mask="_"
      allowEmptyFormatting
    />
  );
});

export default PhoneMask;
