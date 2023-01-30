import styled from "@emotion/styled";

export const FieldsStyled = styled.div`
  &.Fields {
    .fieldset {
      display: block;
      margin: 15px 0;

      .label {
        width: 125px;
        display: inline-block;
        vertical-align: middle;

        sup {
        }

        > * {
          display: inline-block;
          vertical-align: middle;
        }
      }

      .value {
        white-space: pre;
        display: inline-block;
      }
    }

    .buttons {
      margin: 20px 0 0 0;
    }

    .postags {
      .value {
        display: flex;

        .Tags {
          .ant-tag {
            margin: 1px 0 0 1rem;
            vertical-align: top;
            display: inline-block;
            transform: scale(1.1);

            svg {
              padding: 0.5rem 0.125rem 0.5rem 0.25rem;
              box-sizing: content-box;
              vertical-align: -0.5rem;
            }
          }
        }
      }
    }
  }
`;
